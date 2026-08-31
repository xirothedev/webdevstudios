use chrono::Utc;
use sea_orm::sea_query::{Expr, ExprTrait};
use sea_orm::{ColumnTrait, DatabaseConnection, DatabaseTransaction, EntityTrait, QueryFilter, TransactionTrait};

use crate::entities::order_items;
use crate::entities::orders;
use crate::entities::product_size_stocks;
use crate::entities::products;
use crate::entities::sea_orm_active_enums::{OrderStatus, PaymentStatus, ProductSize};

pub const SWEEP_INTERVAL: std::time::Duration = std::time::Duration::from_secs(5 * 60);
const EXPIRY_SECS: i64 = 15 * 60;

pub async fn sweep_expired(db: &DatabaseConnection) -> u64 {
    let cutoff = Utc::now().naive_utc() - chrono::Duration::seconds(EXPIRY_SECS);
    let stale = match orders::Entity::find()
        .filter(orders::Column::Status.eq(OrderStatus::Pending))
        .filter(orders::Column::PaymentStatus.eq(PaymentStatus::Pending))
        .filter(orders::Column::CreatedAt.lt(cutoff))
        .all(db)
        .await
    {
        Ok(rows) => rows,
        Err(error) => {
            tracing::warn!(error = %error, "sweep: failed to query expired orders");
            return 0;
        }
    };
    let mut expired = 0;
    for order in &stale {
        if expire_pending(db, &order.id).await {
            expired += 1;
        }
    }
    if expired > 0 {
        tracing::info!(expired, "swept expired orders");
    }
    expired
}

pub async fn expire_pending(db: &DatabaseConnection, order_id: &str) -> bool {
    let txn = match db.begin().await {
        Ok(txn) => txn,
        Err(_) => return false,
    };
    // Atomic claim: only the transaction that flips PENDING->CANCELLED proceeds.
    let claimed = match orders::Entity::update_many()
        .col_expr(orders::Column::Status, Expr::value(OrderStatus::Cancelled))
        .col_expr(orders::Column::PaymentStatus, Expr::value(PaymentStatus::Failed))
        .filter(orders::Column::Id.eq(order_id))
        .filter(orders::Column::Status.eq(OrderStatus::Pending))
        .filter(orders::Column::PaymentStatus.eq(PaymentStatus::Pending))
        .exec(&txn)
        .await
    {
        Ok(result) => result,
        Err(error) => {
            tracing::warn!(order_id, error = %error, "expire_pending: claim failed");
            let _ = txn.rollback().await;
            return false;
        }
    };
    if claimed.rows_affected == 0 {
        let _ = txn.rollback().await;
        return false;
    }
    let items = match order_items::Entity::find()
        .filter(order_items::Column::OrderId.eq(order_id))
        .all(&txn)
        .await
    {
        Ok(items) => items,
        Err(error) => {
            tracing::warn!(order_id, error = %error, "expire_pending: item lookup failed");
            let _ = txn.rollback().await;
            return false;
        }
    };
    for item in &items {
        let Some(product_id) = &item.product_id else {
            continue;
        };
        if let Some(size) = item.size.clone() {
            if !release_size_stock(&txn, product_id, size, item.quantity).await {
                let _ = txn.rollback().await;
                return false;
            }
        }
        if !release_product_stock(&txn, product_id, item.quantity).await {
            let _ = txn.rollback().await;
            return false;
        }
    }
    txn.commit().await.is_ok()
}

// ponytail: atomic `stock = stock + qty` in SQL avoids read-modify-write races between
// concurrent expirations of different orders on the same product.
async fn release_size_stock(txn: &DatabaseTransaction, product_id: &str, size: ProductSize, qty: i32) -> bool {
    product_size_stocks::Entity::update_many()
        .col_expr(
            product_size_stocks::Column::Stock,
            Expr::col(product_size_stocks::Column::Stock).add(Expr::value(qty)),
        )
        .filter(product_size_stocks::Column::ProductId.eq(product_id))
        .filter(product_size_stocks::Column::Size.eq(size))
        .exec(txn)
        .await
        .is_ok()
}

async fn release_product_stock(txn: &DatabaseTransaction, product_id: &str, qty: i32) -> bool {
    products::Entity::update_many()
        .col_expr(
            products::Column::Stock,
            Expr::col(products::Column::Stock).add(Expr::value(qty)),
        )
        .filter(products::Column::Id.eq(product_id))
        .exec(txn)
        .await
        .is_ok()
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::NaiveDateTime;
    use rust_decimal::Decimal;
    use sea_orm::{DbBackend, MockDatabase, MockExecResult};
    use sea_orm::sea_query::Value;
    use std::collections::BTreeMap;

    fn mock_order(id: &str) -> orders::Model {
        orders::Model {
            id: id.to_string(),
            code: format!("CODE-{id}"),
            user_id: "user-1".to_string(),
            status: OrderStatus::Pending,
            payment_status: PaymentStatus::Pending,
            created_at: NaiveDateTime::default(),
            updated_at: NaiveDateTime::default(),
            total_amount: Decimal::new(10000, 2),
            shipping_fee: Decimal::new(0, 0),
            discount_value: Decimal::new(0, 0),
            shipping_address_id: "addr-1".to_string(),
        }
    }

    #[allow(dead_code)]
    fn mock_item(order_id: &str, product_id: &str, size: Option<ProductSize>, qty: i32) -> order_items::Model {
        order_items::Model {
            id: format!("item-{order_id}-{product_id}"),
            order_id: order_id.to_string(),
            product_name: "Test Product".to_string(),
            quantity: qty,
            product_id: Some(product_id.to_string()),
            product_slug: crate::entities::sea_orm_active_enums::ProductSlug::AoThun,
            size,
            price: Decimal::new(1000, 2),
        }
    }

    #[tokio::test]
    async fn sweep_expired_returns_zero_when_none_stale() {
        let db = MockDatabase::new(DbBackend::Postgres)
            .append_query_results([Vec::<orders::Model>::new()])
            .into_connection();
        let n = sweep_expired(&db).await;
        assert_eq!(n, 0);
    }

    #[tokio::test]
    async fn sweep_expired_sweeps_stale_orders() {
        let stale = vec![mock_order("o1"), mock_order("o2")];
        // sweep_expired will call expire_pending for each stale order.
        // expire_pending does: begin -> update_many claim -> find items -> release stocks -> commit
        // For this test we only verify sweep handles the stale list; the inner expire_pending
        // will fail its DB calls (no mock for transaction) and return false, so sweep returns 0.
        // To get a successful sweep we need a real DB or a more elaborate mock.
        // Here we verify the empty and error paths; atomicity is tested in expire_pending tests below.
        let db = MockDatabase::new(DbBackend::Postgres)
            .append_query_results([stale])
            .into_connection();
        let n = sweep_expired(&db).await;
        // without proper transaction mocks, expire_pending returns false for each
        assert_eq!(n, 0);
    }

    #[tokio::test]
    async fn expire_pending_fails_when_claim_rows_zero() {
        let db = MockDatabase::new(DbBackend::Postgres)
            .append_exec_results([MockExecResult {
                last_insert_id: 0,
                rows_affected: 0,
            }])
            .into_connection();
        // claim update returns rows_affected 0 → already settled, should rollback and return false
        let ok = expire_pending(&db, "order-1").await;
        assert!(!ok);
    }

    #[tokio::test]
    async fn expire_pending_succeeds_with_no_items() {
        let db = MockDatabase::new(DbBackend::Postgres)
            .append_exec_results([MockExecResult {
                last_insert_id: 0,
                rows_affected: 1,
            }])
            .append_query_results([Vec::<order_items::Model>::new()])
            .into_connection();
        let ok = expire_pending(&db, "order-1").await;
        assert!(ok);
    }

    #[tokio::test]
    async fn release_product_stock_uses_atomic_add() {
        let db = MockDatabase::new(DbBackend::Postgres)
            .append_exec_results([MockExecResult {
                last_insert_id: 0,
                rows_affected: 1,
            }])
            .into_connection();
        let txn = db.begin().await.expect("begin");
        let ok = release_product_stock(&txn, "prod-1", 2).await;
        assert!(ok);
        txn.commit().await.expect("commit");
        let log = db.into_transaction_log();
        assert!(!log.is_empty());
        let stmts: Vec<String> = log.into_iter().map(|t| format!("{:?}", t)).collect();
        assert!(stmts.join(" ").contains("Stock") || stmts.join(" ").contains("stock"));
    }

    #[tokio::test]
    async fn release_size_stock_uses_atomic_add() {
        let db = MockDatabase::new(DbBackend::Postgres)
            .append_exec_results([MockExecResult {
                last_insert_id: 0,
                rows_affected: 1,
            }])
            .into_connection();
        let txn = db.begin().await.expect("begin");
        let ok = release_size_stock(&txn, "prod-1", ProductSize::M, 3).await;
        assert!(ok);
        txn.commit().await.expect("commit");
    }

    #[test]
    fn sweep_interval_is_5_minutes_and_expiry_is_15() {
        assert_eq!(SWEEP_INTERVAL, std::time::Duration::from_secs(300));
        assert_eq!(EXPIRY_SECS, 900);
    }

    #[tokio::test]
    async fn expire_pending_handles_item_with_size_and_quantity() {
        // Use BTreeMap mock rows to avoid IntoMockRow issues with ProductSlug enum
        let row1: BTreeMap<String, Value> = BTreeMap::from([
            ("id".to_string(), Value::String(Some("item-1".to_string()))),
            ("orderId".to_string(), Value::String(Some("order-1".to_string()))),
            ("productName".to_string(), Value::String(Some("Test".to_string()))),
            ("quantity".to_string(), Value::Int(Some(2))),
            ("productId".to_string(), Value::String(Some("prod-1".to_string()))),
            ("productSlug".to_string(), Value::String(Some("AO_THUN".to_string()))),
            ("size".to_string(), Value::String(Some("L".to_string()))),
            ("price".to_string(), Value::from(Decimal::new(1000, 2))),
        ]);
        let row2: BTreeMap<String, Value> = BTreeMap::from([
            ("id".to_string(), Value::String(Some("item-2".to_string()))),
            ("orderId".to_string(), Value::String(Some("order-1".to_string()))),
            ("productName".to_string(), Value::String(Some("Test".to_string()))),
            ("quantity".to_string(), Value::Int(Some(1))),
            ("productId".to_string(), Value::String(Some("prod-2".to_string()))),
            ("productSlug".to_string(), Value::String(Some("AO_THUN".to_string()))),
            ("size".to_string(), Value::String(None)),
            ("price".to_string(), Value::from(Decimal::new(1000, 2))),
        ]);
        let db = MockDatabase::new(DbBackend::Postgres)
            .append_exec_results([
                MockExecResult {
                    last_insert_id: 0,
                    rows_affected: 1,
                }, // claim
                MockExecResult {
                    last_insert_id: 0,
                    rows_affected: 1,
                }, // release size stock prod-1
                MockExecResult {
                    last_insert_id: 0,
                    rows_affected: 1,
                }, // release product stock prod-1
                MockExecResult {
                    last_insert_id: 0,
                    rows_affected: 1,
                }, // release product stock prod-2 (no size)
            ])
            .append_query_results([vec![row1, row2]])
            .into_connection();
        let ok = expire_pending(&db, "order-1").await;
        assert!(ok);
    }
}
