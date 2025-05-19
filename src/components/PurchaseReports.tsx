import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import {
  Package,
  DollarSign,
  TrendingUp,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Purchase = Database['public']['Tables']['purchases']['Row'] & {
  product: Database['public']['Tables']['products']['Row'];
};

const PurchaseReports: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Fetch purchases
  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ['purchases', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          id,
          product_id,
          quantity,
          unit_price,
          total_amount,
          supplier,
          purchase_date,
          notes,
          created_at,
          product:products (
            id,
            product_name,
            sku,
            stock_quantity,
            price,
            category
          )
        `)
        .gte('purchase_date', dateRange.start)
        .lte('purchase_date', dateRange.end)
        .order('purchase_date', { ascending: false });

      if (error) throw error;
      return data as Purchase[];
    }
  });

  // Calculate statistics
  const totalPurchases = purchases.reduce((sum, purchase) => sum + purchase.quantity, 0);
  const totalSpent = purchases.reduce((sum, purchase) => sum + purchase.total_amount, 0);
  const averagePrice = totalPurchases > 0 ? totalSpent / totalPurchases : 0;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Package className="h-6 w-6 text-pos-primary" />
          Purchase Reports
        </h1>
        <p className="text-gray-600 mt-1">View purchase history and statistics</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
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
                <p className="text-sm text-gray-500">Total Purchases</p>
                <p className="text-2xl font-semibold text-gray-800">{totalPurchases}</p>
              </div>
              <Package className="h-8 w-8 text-pos-primary" />
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Spent</p>
                <p className="text-2xl font-semibold text-gray-800">${totalSpent.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Average Price</p>
                <p className="text-2xl font-semibold text-gray-800">${averagePrice.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Purchase History */}
        <div>
          <h3 className="text-md font-medium text-gray-800 mb-3">Purchase History</h3>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pos-primary"></div>
            </div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No purchases found in the selected date range</p>
            </div>
          ) : (
            <div className="space-y-2">
              {purchases.map(purchase => (
                <div
                  key={purchase.id}
                  className="p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{purchase.product.product_name}</p>
                      <p className="text-sm text-gray-500">
                        Quantity: {purchase.quantity} units
                      </p>
                      <p className="text-sm text-gray-500">
                        Supplier: {purchase.supplier}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(purchase.purchase_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">
                        ${purchase.total_amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        ${purchase.unit_price.toFixed(2)} per unit
                      </p>
                    </div>
                  </div>
                  {purchase.notes && (
                    <p className="text-sm text-gray-500 mt-2">{purchase.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseReports; 