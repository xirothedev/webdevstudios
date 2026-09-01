<script setup lang="ts">
import { computed, ref } from 'vue';

import AdminDataTable from '@/components/admin/admin-data-table.vue';
import AdminHeader from '@/components/admin/admin-header.vue';
import AdminLayout from '@/components/admin/admin-layout.vue';
import ProductEditor from '@/components/admin/product-editor.vue';
import TableActions from '@/components/admin/table-actions.vue';
import TableFilters from '@/components/admin/table-filters.vue';
import { useAdminProducts } from '@/lib/api/hooks/use-admin';
import { toast } from '@/lib/toast';
import { usePageMeta } from '@/lib/metadata';
import { formatPrice } from '@/lib/utils';

usePageMeta({
  title: 'Quản lý Products',
  description: 'Quản lý sản phẩm trong hệ thống WebDev Studios',
  path: '/admin/products',
});

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

const activeTab = ref<'table' | 'editor'>('table');
const selectedProduct = ref<string | null>(null);
const search = ref('');

const { data, isLoading } = useAdminProducts();

const filteredData = computed(
  () =>
    data.value?.rows.filter(
      (product) =>
        product.name.toLowerCase().includes(search.value.toLowerCase()) ||
        product.slug.toLowerCase().includes(search.value.toLowerCase()),
    ) || [],
);
</script>

<template>
  <AdminLayout>
    <div class="flex h-full flex-col">
      <AdminHeader title="Products Management" description="Quản lý sản phẩm trong hệ thống" />
      <div class="flex-1 space-y-4 p-6">
        <div class="border-wds-accent/20 flex items-center gap-2 border-b">
          <button
            class="cursor-pointer px-4 py-2 font-medium transition-colors"
            :class="
              activeTab === 'table'
                ? 'border-wds-accent text-wds-accent border-b-2'
                : 'text-wds-text/70 hover:text-wds-text'
            "
            @click="activeTab = 'table'"
          >
            Table View
          </button>
          <button
            class="cursor-pointer px-4 py-2 font-medium transition-colors"
            :class="
              activeTab === 'editor'
                ? 'border-wds-accent text-wds-accent border-b-2'
                : 'text-wds-text/70 hover:text-wds-text'
            "
            @click="
              if (selectedProduct) {
                activeTab = 'editor';
              } else {
                toast.info('Vui lòng chọn sản phẩm để chỉnh sửa');
              }
            "
          >
            Editor
          </button>
        </div>

        <template v-if="activeTab === 'table'">
          <AdminDataTable
            :columns="columns"
            :rows="filteredData"
            :is-loading="!!isLoading"
            empty-message="No products found"
          >
            <template #filters>
              <TableFilters
                search-placeholder="Search by name or slug..."
                :search="search"
                @update:search="search = $event"
                :on-clear="() => (search = '')"
              />
            </template>
            <template #cell-priceCurrent="{ row }"> {{ formatPrice(row.priceCurrent) }}₫ </template>
            <template #cell-isPublished="{ row }">
              {{ row.isPublished ? 'Published' : 'Draft' }}
            </template>
            <template #cell-actions="{ row }">
              <TableActions
                :on-edit="
                  () => {
                    selectedProduct = row.id;
                    activeTab = 'editor';
                  }
                "
              />
            </template>
          </AdminDataTable>
        </template>

        <ProductEditor
          v-else-if="selectedProduct"
          :product-id="selectedProduct"
          :on-cancel="
            () => {
              selectedProduct = null;
              activeTab = 'table';
            }
          "
        />
      </div>
    </div>
  </AdminLayout>
</template>
