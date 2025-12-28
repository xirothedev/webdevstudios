'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { ColumnVisibilityToggle } from '@/components/admin/ColumnVisibilityToggle';
import { DataTable } from '@/components/admin/DataTable';
import { ProductEditor } from '@/components/admin/ProductEditor';
import { TableActions } from '@/components/admin/TableActions';
import { TableFilters } from '@/components/admin/TableFilters';
import { adminApi } from '@/lib/api/admin';

const columns = [
  { id: 'id', label: 'ID' },
  { id: 'slug', label: 'Slug' },
  { id: 'name', label: 'Name' },
  { id: 'priceCurrent', label: 'Price' },
  { id: 'stock', label: 'Stock' },
  { id: 'ratingValue', label: 'Rating' },
  { id: 'isPublished', label: 'Status' },
  { id: 'actions', label: 'Actions' },
];

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState<'table' | 'editor'>('table');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    columns.map((c) => c.id)
  );

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => adminApi.listProducts(),
  });

  const filteredData =
    data?.products.filter(
      (product) =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.slug.toLowerCase().includes(search.toLowerCase())
    ) || [];

  const tableData = filteredData.map((product) => ({
    ...product,
    priceCurrent: new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(product.priceCurrent),
    isPublished: product.isPublished ? 'Published' : 'Draft',
    actions: (
      <TableActions
        onEdit={() => {
          setSelectedProduct(product.id);
          setActiveTab('editor');
        }}
      />
    ),
  }));

  return (
    <div className="flex h-full flex-col">
      <AdminHeader
        title="Products Management"
        description="Quản lý sản phẩm trong hệ thống"
      />
      <div className="flex-1 space-y-4 p-6">
        <div className="border-wds-accent/20 flex items-center gap-2 border-b">
          <button
            onClick={() => setActiveTab('table')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'table'
                ? 'border-wds-accent text-wds-accent border-b-2'
                : 'text-wds-text/70 hover:text-wds-text'
            }`}
          >
            Table View
          </button>
          <button
            onClick={() => {
              if (selectedProduct) {
                setActiveTab('editor');
              } else {
                toast.info('Vui lòng chọn sản phẩm để chỉnh sửa');
              }
            }}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'editor'
                ? 'border-wds-accent text-wds-accent border-b-2'
                : 'text-wds-text/70 hover:text-wds-text'
            }`}
          >
            Editor
          </button>
        </div>

        {activeTab === 'table' ? (
          <>
            <div className="flex items-center justify-between">
              <TableFilters
                searchPlaceholder="Search by name or slug..."
                onSearchChange={setSearch}
                onClear={() => setSearch('')}
              />
              <ColumnVisibilityToggle
                columns={columns}
                visibleColumns={visibleColumns}
                onVisibilityChange={setVisibleColumns}
              />
            </div>
            <DataTable
              columns={columns}
              data={tableData}
              visibleColumns={visibleColumns}
              isLoading={isLoading}
              emptyMessage="No products found"
            />
          </>
        ) : (
          selectedProduct && (
            <ProductEditor
              productId={selectedProduct}
              onSave={() => {
                refetch();
                toast.success('Product updated successfully');
              }}
              onCancel={() => {
                setSelectedProduct(null);
                setActiveTab('table');
              }}
            />
          )
        )}
      </div>
    </div>
  );
}
