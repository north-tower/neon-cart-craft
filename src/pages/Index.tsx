
import React from 'react';
import Navbar from '@/components/Navbar';
import ProductCatalog from '@/components/ProductCatalog';
import { toast } from 'sonner';
import { Package } from 'lucide-react';

const Index: React.FC = () => {
  React.useEffect(() => {
    toast(
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full flex items-center justify-center bg-pos-primary/10">
          <Package className="h-4 w-4 text-pos-primary" />
        </div>
        <div>
          <div className="font-medium">Welcome to NeonPOS</div>
          <div className="text-sm text-muted-foreground">
            Manage your products with style
          </div>
        </div>
      </div>, 
      {
        position: 'top-right',
      }
    );

    toast.info(
      "This is a demo with mock products. To save real products, connect to Supabase",
      {
        duration: 10000,
        position: 'top-center',
      }
    );
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-800">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-pos-primary to-pos-secondary">
                NeonPOS Product Catalog
              </span>
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Easily manage your product inventory with our modern catalog system.
              Add, edit, and remove products seamlessly.
            </p>
          </div>
          
          <ProductCatalog />
        </div>
      </main>
      
      <footer className="border-t border-gray-200 py-6 bg-gray-50">
        <div className="container mx-auto text-center text-gray-500 text-sm">
          <p>NeonPOS &copy; {new Date().getFullYear()} - A modern POS platform</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
