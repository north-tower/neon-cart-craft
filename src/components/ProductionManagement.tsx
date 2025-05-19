import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Package,
  Plus,
  Search,
  Factory,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
  price: number;
  category: string;
  product_type: 'component' | 'finished';
}

interface Recipe {
  finished_product_id: string;
  component_id: string;
  quantity_required: number;
  component: Product;
}

interface ProductionBatch {
  id: string;
  finished_product_id: string;
  quantity_produced: number;
  status: 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
}

const ProductionManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productionQuantity, setProductionQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const queryClient = useQueryClient();

  // Fetch products
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*');
      
      if (error) throw error;
      
      return data.map((item) => ({
        id: String(item.id),
        name: item.product_name,
        description: item.description || '',
        price: Number(item.price),
        category: item.category || '',
        sku: item.sku,
        stock: item.stock_quantity || 0,
        image: item.photo_url,
        product_type: item.product_type || 'component',
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));
    }
  });

  // Fetch recipes for selected product
  const { data: recipes = [], isLoading: isLoadingRecipes } = useQuery({
    queryKey: ['recipes', selectedProduct?.id],
    queryFn: async () => {
      if (!selectedProduct) return [];

      const { data, error } = await supabase
        .from('product_recipes')
        .select(`
          *,
          component:products(*)
        `)
        .eq('finished_product_id', selectedProduct.id);

      if (error) throw error;

      return data.map((item) => ({
        finished_product_id: String(item.finished_product_id),
        component_id: String(item.component_id),
        quantity_required: Number(item.quantity_required),
        component: {
          id: String(item.component.id),
          name: item.component.product_name,
          sku: item.component.sku,
          stock: item.component.stock_quantity || 0,
          price: Number(item.component.price),
          category: item.component.category || '',
          product_type: item.component.product_type || 'component'
        }
      }));
    },
    enabled: !!selectedProduct
  });

  // Create production batch mutation
  const createProductionBatchMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProduct) throw new Error('No product selected');

      // Start a transaction
      const { data: batch, error: batchError } = await supabase
        .from('production_batches')
        .insert([{
          finished_product_id: Number(selectedProduct.id),
          quantity_produced: productionQuantity,
          status: 'in_progress',
          notes
        }])
        .select()
        .single();

      if (batchError) throw batchError;

      // Check if we have enough components
      for (const recipe of recipes) {
        const requiredQuantity = recipe.quantity_required * productionQuantity;
        if (recipe.component.stock < requiredQuantity) {
          throw new Error(`Not enough stock of ${recipe.component.name}. Required: ${requiredQuantity}, Available: ${recipe.component.stock}`);
        }
      }

      // Deduct components and record usage
      for (const recipe of recipes) {
        const quantityUsed = recipe.quantity_required * productionQuantity;
        
        // Update component stock
        const { error: updateError } = await supabase
          .from('products')
          .update({
            stock_quantity: recipe.component.stock - quantityUsed
          })
          .eq('id', Number(recipe.component_id));

        if (updateError) throw updateError;

        // Record component usage
        const { error: usageError } = await supabase
          .from('production_batch_components')
          .insert([{
            batch_id: batch.id,
            component_id: Number(recipe.component_id),
            quantity_used: quantityUsed
          }]);

        if (usageError) throw usageError;
      }

      // Update finished product stock
      const { error: productError } = await supabase
        .from('products')
        .update({
          stock_quantity: selectedProduct.stock + productionQuantity
        })
        .eq('id', Number(selectedProduct.id));

      if (productError) throw productError;

      // Mark batch as completed
      const { error: completeError } = await supabase
        .from('production_batches')
        .update({ status: 'completed' })
        .eq('id', batch.id);

      if (completeError) throw completeError;

      return batch;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Production batch completed successfully');
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to complete production: ${error.message}`);
    }
  });

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      toast.error('Please select a product');
      return;
    }

    createProductionBatchMutation.mutate();
  };

  const resetForm = () => {
    setSelectedProduct(null);
    setProductionQuantity(1);
    setNotes('');
  };

  const filteredProducts = products.filter(
    product =>
      product.product_type === 'finished' &&
      (product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       product.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Factory className="h-6 w-6 text-pos-primary" />
          Production Management
        </h1>
        <p className="text-gray-600 mt-1">Create finished products from components</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Finished Product</h2>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search finished products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedProduct?.id === product.id
                    ? 'bg-pos-primary/10 border border-pos-primary'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => handleProductSelect(product)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">{product.name}</p>
                    <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-pos-primary">${product.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Production Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Production Details</h2>
          {selectedProduct ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selected Product
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-800">{selectedProduct.name}</p>
                  <p className="text-sm text-gray-500">Current Stock: {selectedProduct.stock}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Production Quantity
                </label>
                <Input
                  type="number"
                  min="1"
                  value={productionQuantity}
                  onChange={(e) => setProductionQuantity(parseInt(e.target.value) || 0)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required Components
                </label>
                <div className="space-y-2">
                  {recipes.map(recipe => {
                    const requiredQuantity = recipe.quantity_required * productionQuantity;
                    const hasEnoughStock = recipe.component.stock >= requiredQuantity;
                    
                    return (
                      <div
                        key={recipe.component_id}
                        className={`p-3 rounded-lg ${
                          hasEnoughStock ? 'bg-green-50' : 'bg-red-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-800">{recipe.component.name}</p>
                            <p className="text-sm text-gray-500">
                              Required: {requiredQuantity} units
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${
                              hasEnoughStock ? 'text-green-600' : 'text-red-600'
                            }`}>
                              Stock: {recipe.component.stock}
                            </p>
                            {hasEnoughStock ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes about this production batch"
                />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-pos-primary hover:bg-pos-secondary"
                  disabled={createProductionBatchMutation.isPending}
                >
                  {createProductionBatchMutation.isPending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Factory className="h-4 w-4 mr-2" />
                      Start Production
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>Select a finished product to start production</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductionManagement; 