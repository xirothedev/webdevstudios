use sea_orm::Database;
use sea_orm::DatabaseConnection;
use sea_orm::DbErr;

pub async fn connect(database_url: &str) -> Result<DatabaseConnection, DbErr> {
    let db = Database::connect(database_url).await?;
    Ok(db)
}
