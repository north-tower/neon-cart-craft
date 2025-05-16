
import React from 'react';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Edit, Trash } from 'lucide-react';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  onDelete: (id: string) => void;
  onEdit: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onDelete, onEdit }) => {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(product.price);

  const handleAddToCart = () => {
    toast.success(`Added ${product.name} to cart`);
  };

  return (
    <div className="pos-card group overflow-hidden animate-slide-up">
      <div className="relative overflow-hidden">
        <div className="aspect-square w-full bg-gray-100 flex items-center justify-center">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <Package className="h-16 w-16 text-gray-400" />
          )}
        </div>
        
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 transform translate-x-4 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
          <Button
            onClick={() => onEdit(product)}
            size="icon"
            variant="secondary"
            className="h-8 w-8 bg-white/80 backdrop-blur-sm shadow-sm"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => onDelete(product.id)}
            size="icon"
            variant="destructive"
            className="h-8 w-8 bg-white/80 backdrop-blur-sm shadow-sm"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="pos-heading text-base line-clamp-1">{product.name}</h3>
          <span className="text-pos-primary font-semibold">{formattedPrice}</span>
        </div>
        
        <p className="text-gray-600 text-sm line-clamp-2 mb-3 min-h-[40px]">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className={`pos-badge ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>
          
          <Button
            onClick={handleAddToCart}
            size="sm"
            disabled={product.stock <= 0}
            className="bg-pos-primary hover:bg-pos-secondary text-white"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            <span>Add</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
