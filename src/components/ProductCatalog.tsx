
import React, { useState, useEffect } from 'react';
import { Product } from '@/types/product';
import ProductGrid from './ProductGrid';
import AddProductModal from './AddProductModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Package } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const ProductCatalog: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const queryClient = useQueryClient();

  // Fetch products from Supabase
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*');
      
      if (error) {
        toast.error('Failed to load products');
        throw error;
      }
      
      // Convert the database format to our Product type
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

  // Add product mutation
  const addProductMutation = useMutation({
    mutationFn: async (productData: Partial<Product>) => {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          product_name: productData.name,
          description: productData.description,
          price: productData.price,
          category: productData.category,
          sku: productData.sku,
          stock_quantity: productData.stock,
          photo_url: productData.image
        }])
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product added successfully');
    },
    onError: (error) => {
      toast.error(`Failed to add product: ${error.message}`);
    }
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async (productData: Partial<Product>) => {
      const { data, error } = await supabase
        .from('products')
        .update({
          product_name: productData.name,
          description: productData.description,
          price: productData.price,
          category: productData.category,
          sku: productData.sku,
          stock_quantity: productData.stock,
          photo_url: productData.image,
          updated_at: new Date()
        })
        .eq('id', productData.id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update product: ${error.message}`);
    }
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete product: ${error.message}`);
    }
  });

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (id: string) => {
    deleteProductMutation.mutate(id);
  };

  const handleSaveProduct = (productData: Partial<Product>) => {
    if (editingProduct) {
      // Update existing product
      updateProductMutation.mutate({ 
        ...productData, 
        id: editingProduct.id 
      });
    } else {
      // Add new product
      addProductMutation.mutate(productData);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Package className="h-6 w-6 text-pos-primary" />
          Product Catalog
        </h2>
        <Button
          onClick={handleAddProduct}
          className="bg-pos-primary hover:bg-pos-secondary"
        >
          <Plus className="h-5 w-5 mr-1" />
          Add Product
        </Button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pos-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">
          Error loading products. Please try again.
        </div>
      ) : (
        <ProductGrid
          products={filteredProducts}
          onDelete={handleDeleteProduct}
          onEdit={handleEditProduct}
        />
      )}

      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
      />
    </div>
  );
};

export default ProductCatalog;
