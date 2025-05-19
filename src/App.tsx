import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import ProductCatalog from '@/components/ProductCatalog';
import POSInterface from '@/components/POSInterface';
import OrderSuccess from '@/components/OrderSuccess';
import InventoryDashboard from '@/components/InventoryDashboard';
import PurchaseManagement from '@/components/PurchaseManagement';
import ProductionManagement from '@/components/ProductionManagement';
import RecipeManagement from '@/components/RecipeManagement';
import ProductionProcessing from '@/components/ProductionProcessing';
import PurchaseReports from '@/components/PurchaseReports';
import { Package, ShoppingCart, BarChart3, ShoppingBag, Factory, ListPlus, BarChart2 } from 'lucide-react';

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <h1 className="text-xl font-bold text-pos-primary">NeonPOS</h1>
                  </div>
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    <Link
                      to="/"
                      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Products
                    </Link>
                    <Link
                      to="/pos"
                      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      POS
                    </Link>
                    <Link
                      to="/inventory"
                      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Inventory
                    </Link>
                    <Link
                      to="/purchases"
                      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Purchases
                    </Link>
                    <Link
                      to="/purchase-reports"
                      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      <BarChart2 className="h-4 w-4 mr-2" />
                      Purchase Reports
                    </Link>
                    <Link
                      to="/production"
                      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      <Factory className="h-4 w-4 mr-2" />
                      Production
                    </Link>
                    <Link
                      to="/recipes"
                      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      <ListPlus className="h-4 w-4 mr-2" />
                      Recipes
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<ProductCatalog />} />
              <Route path="/pos" element={<POSInterface />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/inventory" element={<InventoryDashboard />} />
              <Route path="/purchases" element={<PurchaseManagement />} />
              <Route path="/purchase-reports" element={<PurchaseReports />} />
              <Route path="/production" element={<ProductionProcessing />} />
              <Route path="/recipes" element={<RecipeManagement />} />
            </Routes>
          </main>
        </div>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
};

export default App;
