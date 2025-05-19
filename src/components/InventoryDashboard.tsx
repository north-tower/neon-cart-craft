import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { format } from 'date-fns';

interface InventoryMetrics {
  totalProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalValue: number;
  recentOrders: number;
  stockAlerts: Array<{
    id: string;
    name: string;
    stock: number;
    threshold: number;
  }>;
  topSellingProducts: Array<{
    id: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
}

const InventoryDashboard: React.FC = () => {
  // Fetch inventory metrics
  const { data: metrics, isLoading } = useQuery<InventoryMetrics>({
    queryKey: ['inventory-metrics'],
    queryFn: async () => {
      // Get all products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*');
      
      if (productsError) throw productsError;

      // Get recent orders (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: recentOrders, error: ordersError } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .gte('created_at', sevenDaysAgo.toISOString());

      if (ordersError) throw ordersError;

      // Calculate metrics
      const totalProducts = products.length;
      const lowStockItems = products.filter(p => p.stock_quantity <= 10 && p.stock_quantity > 0).length;
      const outOfStockItems = products.filter(p => p.stock_quantity === 0).length;
      const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0);

      // Calculate stock alerts
      const stockAlerts = products
        .filter(p => p.stock_quantity <= 10)
        .map(p => ({
          id: p.id,
          name: p.product_name,
          stock: p.stock_quantity,
          threshold: 10
        }));

      // Calculate top selling products
      const productSales = new Map();
      recentOrders?.forEach(order => {
        order.order_items.forEach((item: any) => {
          const current = productSales.get(item.product_id) || { quantity: 0, revenue: 0 };
          productSales.set(item.product_id, {
            quantity: current.quantity + item.quantity,
            revenue: current.revenue + (item.price * item.quantity)
          });
        });
      });

      const topSellingProducts = Array.from(productSales.entries())
        .map(([id, data]: [string, any]) => {
          const product = products.find(p => p.id === Number(id));
          return {
            id,
            name: product?.product_name || 'Unknown Product',
            quantity: data.quantity,
            revenue: data.revenue
          };
        })
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      return {
        totalProducts,
        lowStockItems,
        outOfStockItems,
        totalValue,
        recentOrders: recentOrders?.length || 0,
        stockAlerts,
        topSellingProducts
      };
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pos-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Package className="h-6 w-6 text-pos-primary" />
          Inventory Dashboard
        </h1>
        <p className="text-gray-600 mt-1">Monitor your store's inventory status and metrics</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Products"
          value={metrics?.totalProducts || 0}
          icon={<Package className="h-5 w-5" />}
          trend={null}
        />
        <MetricCard
          title="Low Stock Items"
          value={metrics?.lowStockItems || 0}
          icon={<AlertTriangle className="h-5 w-5" />}
          trend={null}
          trendDirection="up"
          trendColor="red"
        />
        <MetricCard
          title="Out of Stock"
          value={metrics?.outOfStockItems || 0}
          icon={<AlertTriangle className="h-5 w-5" />}
          trend={null}
          trendDirection="up"
          trendColor="red"
        />
        <MetricCard
          title="Total Inventory Value"
          value={`$${metrics?.totalValue.toFixed(2) || '0.00'}`}
          icon={<DollarSign className="h-5 w-5" />}
          trend={null}
        />
      </div>

      {/* Stock Alerts and Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Alerts */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Stock Alerts</h2>
          {metrics?.stockAlerts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No stock alerts at the moment</p>
          ) : (
            <div className="space-y-4">
              {metrics?.stockAlerts.map(alert => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{alert.name}</p>
                    <p className="text-sm text-red-600">
                      Only {alert.stock} items left
                    </p>
                  </div>
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Selling Products</h2>
          {metrics?.topSellingProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No sales data available</p>
          ) : (
            <div className="space-y-4">
              {metrics?.topSellingProducts.map(product => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{product.name}</p>
                    <p className="text-sm text-gray-600">
                      {product.quantity} units sold
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-pos-primary">
                      ${product.revenue.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: number | null;
  trendDirection?: 'up' | 'down';
  trendColor?: 'green' | 'red';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendDirection,
  trendColor
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${
          trendColor === 'red' ? 'bg-red-100' : 'bg-green-100'
        }`}>
          {icon}
        </div>
      </div>
      {trend !== null && (
        <div className="flex items-center mt-4 text-sm">
          {trendDirection === 'up' ? (
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          )}
          <span className={`ml-1 ${
            trendColor === 'red' ? 'text-red-500' : 'text-green-500'
          }`}>
            {trend}% from last period
          </span>
        </div>
      )}
    </div>
  );
};

export default InventoryDashboard; 