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
  DollarSign,
  ShoppingBag,
  AlertTriangle
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
  price: number;
  category: string;
}

interface Purchase {
  product_id: string;
  quantity: number;
  unit_price: number;
  supplier: string;
  purchase_date: string;
  notes?: string;
}

const PurchaseManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [purchaseDetails, setPurchaseDetails] = useState<Partial<Purchase>>({
    quantity: 1,
    unit_price: 0,
    supplier: '',
    purchase_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const queryClient = useQueryClient();

  // Fetch products
  const { data: products = [], isLoading } = useQuery({
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
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));
    }
  });

  // Create purchase mutation
  const createPurchaseMutation = useMutation({
    mutationFn: async (purchase: Purchase) => {
      // First, create the purchase record
      const { data: purchaseRecord, error: purchaseError } = await supabase
        .from('purchases')
        .insert([{
          product_id: Number(purchase.product_id),
          quantity: purchase.quantity,
          unit_price: purchase.unit_price,
          supplier: purchase.supplier,
          purchase_date: purchase.purchase_date,
          notes: purchase.notes,
          total_amount: purchase.quantity * purchase.unit_price
        }])
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      // Then, update the product stock
      const { error: updateError } = await supabase
        .from('products')
        .update({
          stock_quantity: selectedProduct!.stock + purchase.quantity
        })
        .eq('id', Number(purchase.product_id));

      if (updateError) throw updateError;

      return purchaseRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Purchase recorded successfully');
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to record purchase: ${error.message}`);
    }
  });

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setPurchaseDetails(prev => ({
      ...prev,
      unit_price: product.price
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      toast.error('Please select a product');
      return;
    }

    createPurchaseMutation.mutate({
      product_id: selectedProduct.id,
      quantity: purchaseDetails.quantity || 0,
      unit_price: purchaseDetails.unit_price || 0,
      supplier: purchaseDetails.supplier || '',
      purchase_date: purchaseDetails.purchase_date || new Date().toISOString().split('T')[0],
      notes: purchaseDetails.notes
    });
  };

  const resetForm = () => {
    setSelectedProduct(null);
    setPurchaseDetails({
      quantity: 1,
      unit_price: 0,
      supplier: '',
      purchase_date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const filteredProducts = products.filter(
    product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-pos-primary" />
          Purchase Management
        </h1>
        <p className="text-gray-600 mt-1">Add stock to your inventory through purchases</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Product</h2>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search products..."
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

        {/* Purchase Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Purchase Details</h2>
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
                  Quantity
                </label>
                <Input
                  type="number"
                  min="1"
                  value={purchaseDetails.quantity}
                  onChange={(e) => setPurchaseDetails(prev => ({
                    ...prev,
                    quantity: parseInt(e.target.value) || 0
                  }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Price ($)
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={purchaseDetails.unit_price}
                  onChange={(e) => setPurchaseDetails(prev => ({
                    ...prev,
                    unit_price: parseFloat(e.target.value) || 0
                  }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier
                </label>
                <Input
                  value={purchaseDetails.supplier}
                  onChange={(e) => setPurchaseDetails(prev => ({
                    ...prev,
                    supplier: e.target.value
                  }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purchase Date
                </label>
                <Input
                  type="date"
                  value={purchaseDetails.purchase_date}
                  onChange={(e) => setPurchaseDetails(prev => ({
                    ...prev,
                    purchase_date: e.target.value
                  }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <Input
                  value={purchaseDetails.notes}
                  onChange={(e) => setPurchaseDetails(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                  placeholder="Optional notes about this purchase"
                />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-pos-primary hover:bg-pos-secondary"
                  disabled={createPurchaseMutation.isPending}
                >
                  {createPurchaseMutation.isPending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Record Purchase
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>Select a product to record a purchase</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseManagement; 