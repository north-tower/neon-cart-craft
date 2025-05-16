
import React from 'react';
import { Product } from '@/types/product';
import ProductCard from './ProductCard';
import { Package } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductGridProps {
  products: Product[];
  onDelete: (id: string) => void;
  onEdit: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onDelete, onEdit }) => {
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Package className="h-16 w-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-600">No products found</h3>
        <p className="text-gray-500">Add some products to your catalog!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
