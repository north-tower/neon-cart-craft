import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Factory,
  Search,
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BarChart2,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Product = Database['public']['Tables']['products']['Row'];
type ProductionBatch = Database['public']['Tables']['production_batches']['Row'] & {
  finished_product: Product;
};

interface Recipe {
  id: string;
  finished_product_id: string;
  component_id: string;
  quantity_required: number;
  component: Product;
}

const ProductionProcessing: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productionQuantity, setProductionQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const queryClient = useQueryClient();

  // Add this function to format dates for the query
  const formatDateForQuery = (dateStr: string, isEndDate: boolean = false) => {
    const date = new Date(dateStr);
    if (isEndDate) {
      date.setHours(23, 59, 59, 999);
    } else {
      date.setHours(0, 0, 0, 0);
    }
    return date.toISOString();
  };

  // Fetch finished products
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('product_type', 'finished');
      
      if (error) throw error;
      return data;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Fetch production batches
  const { data: productionBatches = [], isLoading: isLoadingBatches } = useQuery({
    queryKey: ['production-batches', dateRange],
    queryFn: async () => {
      console.log('Fetching production batches with date range:', dateRange);
      const { data, error } = await supabase
        .from('production_batches')
        .select(`
          id,
          finished_product_id,
          quantity_produced,
          status,
          notes,
          created_at,
          updated_at,
          finished_product:products!finished_product_id (
            id,
            product_name,
            sku,
            stock_quantity,
            price,
            category,
            product_type,
            description,
            photo_url,
            created_at,
            updated_at,
            available_colors,
            features,
            minimum_order,
            ratings,
            reviews_count,
            seller_id,
            specifications,
            status
          )
        `)
        .gte('created_at', formatDateForQuery(dateRange.start))
        .lte('created_at', formatDateForQuery(dateRange.end, true))
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching production batches:', error);
        throw error;
      }
      
      console.log('Fetched production batches:', data);
      
      return data.map(batch => {
        const finishedProduct = batch.finished_product as unknown as Product;
        return {
          ...batch,
          finished_product: {
            ...finishedProduct,
            id: Number(finishedProduct.id),
            price: Number(finishedProduct.price),
            stock_quantity: finishedProduct.stock_quantity || 0
          }
        };
      }) as ProductionBatch[];
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Fetch recipes for selected product
  const { data: recipes = [], isLoading: isLoadingRecipes } = useQuery({
    queryKey: ['recipes', selectedProduct?.id],
    queryFn: async () => {
      if (!selectedProduct) return [];

      const { data, error } = await supabase
        .from('product_recipes')
        .select(`
          id,
          finished_product_id,
          component_id,
          quantity_required,
          component:products!component_id (
            id,
            product_name,
            sku,
            stock_quantity,
            price,
            category,
            product_type,
            description,
            photo_url,
            created_at,
            updated_at,
            available_colors,
            features,
            minimum_order,
            ratings,
            reviews_count,
            seller_id,
            specifications,
            status
          )
        `)
        .eq('finished_product_id', selectedProduct.id);

      if (error) throw error;

      return data.map((item) => {
        const component = item.component as unknown as Product;
        return {
          id: String(item.id),
          finished_product_id: String(item.finished_product_id),
          component_id: String(item.component_id),
          quantity_required: Number(item.quantity_required),
          component: {
            ...component,
            id: Number(component.id),
            price: Number(component.price),
            stock_quantity: component.stock_quantity || 0
          }
        };
      });
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
        if (recipe.component.stock_quantity < requiredQuantity) {
          throw new Error(`Not enough stock of ${recipe.component.product_name}. Required: ${requiredQuantity}, Available: ${recipe.component.stock_quantity}`);
        }
      }

      // Deduct components and record usage
      for (const recipe of recipes) {
        const quantityUsed = recipe.quantity_required * productionQuantity;
        
        // Update component stock
        const { error: updateError } = await supabase
          .from('products')
          .update({
            stock_quantity: recipe.component.stock_quantity - quantityUsed
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
          stock_quantity: selectedProduct.stock_quantity + productionQuantity
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
      queryClient.invalidateQueries({ queryKey: ['production-batches'] });
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
      product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate production statistics
  const totalProduced = productionBatches.reduce((sum, batch) => sum + batch.quantity_produced, 0);
  const completedBatches = productionBatches.filter(batch => batch.status === 'completed').length;
  const totalValue = productionBatches.reduce((sum, batch) => 
    sum + (batch.quantity_produced * batch.finished_product.price), 0
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Factory className="h-6 w-6 text-pos-primary" />
          Production Processing
        </h1>
        <p className="text-gray-600 mt-1">Process production batches and view reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Start Production</h2>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search finished products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-2 max-h-[200px] overflow-y-auto mb-4">
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
                    <p className="font-medium text-gray-800">{product.product_name}</p>
                    <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-pos-primary">${product.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Stock: {product.stock_quantity}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedProduct && (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  Notes
                </label>
                <Input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional production notes..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required Components
                </label>
                <div className="space-y-2">
                  {recipes.map(recipe => {
                    const requiredQuantity = recipe.quantity_required * productionQuantity;
                    const hasEnoughStock = recipe.component.stock_quantity >= requiredQuantity;
                    
                    return (
                      <div
                        key={recipe.component_id}
                        className={`p-3 rounded-lg ${
                          hasEnoughStock ? 'bg-green-50' : 'bg-red-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-800">{recipe.component.product_name}</p>
                            <p className="text-sm text-gray-500">
                              Required: {requiredQuantity} units
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${
                              hasEnoughStock ? 'text-green-600' : 'text-red-600'
                            }`}>
                              Stock: {recipe.component.stock_quantity}
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
            </form>
          )}
        </div>

        {/* Production Reports */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Production Reports</h2>

          {/* Date Range Filter */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Produced</p>
                  <p className="text-2xl font-semibold text-gray-800">{totalProduced}</p>
                </div>
                <Package className="h-8 w-8 text-pos-primary" />
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Completed Batches</p>
                  <p className="text-2xl font-semibold text-gray-800">{completedBatches}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Value</p>
                  <p className="text-2xl font-semibold text-gray-800">${totalValue.toFixed(2)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Production History */}
          <div>
            <h3 className="text-md font-medium text-gray-800 mb-3">Recent Production Batches</h3>
            {isLoadingBatches ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pos-primary"></div>
              </div>
            ) : productionBatches.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No production batches found in the selected date range</p>
              </div>
            ) : (
              <div className="space-y-2">
                {productionBatches.map(batch => (
                  <div
                    key={batch.id}
                    className="p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-800">{batch.finished_product.product_name}</p>
                        <p className="text-sm text-gray-500">
                          Quantity: {batch.quantity_produced} units
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(batch.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          batch.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                        </p>
                        <p className="text-sm text-gray-500">
                          ${(batch.quantity_produced * batch.finished_product.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    {batch.notes && (
                      <p className="text-sm text-gray-500 mt-2">{batch.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionProcessing; 