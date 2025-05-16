
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar: React.FC = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 py-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Package className="h-6 w-6 text-pos-primary" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pos-primary to-pos-secondary">
            NeonPOS
          </span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex gap-1.5 items-center"
          >
            Products
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex gap-1.5 items-center"
          >
            Categories
          </Button>
          <Button
            variant="default"
            size="sm"
            className="gap-1.5 items-center bg-pos-primary hover:bg-pos-secondary"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden md:inline">Cart</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
