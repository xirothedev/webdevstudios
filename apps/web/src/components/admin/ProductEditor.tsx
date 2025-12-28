'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminApi } from '@/lib/api/admin';

interface ProductEditorProps {
  productId: string;
  onSave?: () => void;
  onCancel?: () => void;
}

export function ProductEditor({
  productId,
  onSave,
  onCancel,
}: ProductEditorProps) {
  const queryClient = useQueryClient();

  const { data: products } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: () => adminApi.listProducts(),
  });

  const product = products?.products.find((p) => p.id === productId);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (product) {
      setDescription(product.description);
    }
  }, [product]);

  const updateMutation = useMutation({
    mutationFn: (data: {
      name?: string;
      description?: string;
      priceCurrent?: number;
      priceOriginal?: number | null;
      badge?: string | null;
      isPublished?: boolean;
    }) => adminApi.updateProduct(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('Product updated successfully');
      onSave?.();
    },
    onError: () => {
      toast.error('Failed to update product');
    },
  });

  if (!product) {
    return <div className="text-wds-text/70">Product not found</div>;
  }

  const handleSave = () => {
    updateMutation.mutate({
      description: description,
    });
  };

  return (
    <div className="border-wds-accent/30 bg-wds-background space-y-4 rounded-2xl border p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-wds-text text-xl font-bold">
          Edit: {product.name}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-wds-accent/30 bg-wds-background text-wds-text hover:bg-wds-accent/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="bg-wds-accent hover:bg-wds-accent/90 text-black"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-wds-text mb-2 block text-sm font-medium">
            Description
          </label>
          <textarea
            value={description || product.description}
            onChange={(e) => setDescription(e.target.value)}
            rows={15}
            className="border-wds-accent/30 bg-wds-background text-wds-text placeholder:text-wds-text/50 focus:border-wds-accent focus:ring-wds-accent/20 w-full rounded-lg border px-4 py-2 text-sm focus:ring-2 focus:outline-none"
            placeholder="Enter product description (supports markdown)..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-wds-text mb-2 block text-sm font-medium">
              Current Price
            </label>
            <Input
              type="number"
              defaultValue={product.priceCurrent}
              className="border-wds-accent/30 bg-wds-background text-wds-text"
            />
          </div>
          <div>
            <label className="text-wds-text mb-2 block text-sm font-medium">
              Original Price
            </label>
            <Input
              type="number"
              defaultValue={product.priceOriginal || undefined}
              className="border-wds-accent/30 bg-wds-background text-wds-text"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
