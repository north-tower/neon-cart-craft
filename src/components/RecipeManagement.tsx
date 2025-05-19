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
  ListPlus,
  Trash2,
  AlertTriangle
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
  price: number;
  category: string;
  product_type: 'component' | 'finished';
}

interface Recipe {
  id: string;
  finished_product_id: string;
  component_id: string;
  quantity_required: number;
  component: Product;
}

interface SupabaseComponent {
  id: string;
  product_name: string;
  sku: string;
  stock_quantity: number;
  price: number;
  category: string;
  product_type: string;
}

interface SupabaseRecipe {
  id: any;
  finished_product_id: any;
  component_id: any;
  quantity_required: any;
  component: SupabaseComponent;
}

const RecipeManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<Product | null>(null);
  const [quantityRequired, setQuantityRequired] = useState(1);

  const queryClient = useQueryClient();

  // Fetch products
  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
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
        product_type: item.product_type || 'component',
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));
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
            product_type
          )
        `)
        .eq('finished_product_id', selectedProduct.id);

      if (error) throw error;

      return (data as unknown as SupabaseRecipe[]).map((item) => ({
        id: String(item.id),
        finished_product_id: String(item.finished_product_id),
        component_id: String(item.component_id),
        quantity_required: Number(item.quantity_required),
        component: {
          id: String(item.component.id),
          name: item.component.product_name,
          sku: item.component.sku,
          stock: item.component.stock_quantity || 0,
          price: Number(item.component.price),
          category: item.component.category || '',
          product_type: item.component.product_type || 'component'
        }
      }));
    },
    enabled: !!selectedProduct,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Add recipe mutation
  const addRecipeMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProduct || !selectedComponent) {
        throw new Error('Please select both a finished product and a component');
      }

      // First, add the new recipe
      const { data, error } = await supabase
        .from('product_recipes')
        .insert([{
          finished_product_id: Number(selectedProduct.id),
          component_id: Number(selectedComponent.id),
          quantity_required: quantityRequired
        }])
        .select();

      if (error) throw error;

      // Fetch all recipes for this product to calculate total cost
      const { data: allRecipes, error: recipesError } = await supabase
        .from('product_recipes')
        .select(`
          quantity_required,
          component:products!component_id (
            price
          )
        `)
        .eq('finished_product_id', selectedProduct.id);

      if (recipesError) throw recipesError;

      // Calculate total cost of components
      const totalCost = (allRecipes as unknown as { quantity_required: number; component: { price: number } }[])
        .reduce((sum, recipe) => {
          return sum + (recipe.quantity_required * Number(recipe.component.price));
        }, 0);

      // Add 30% markup for profit
      const finalPrice = totalCost * 1.3;

      // Update the finished product's price
      const { error: updateError } = await supabase
        .from('products')
        .update({ price: finalPrice })
        .eq('id', selectedProduct.id);

      if (updateError) throw updateError;

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes', selectedProduct?.id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Recipe added successfully and product price updated');
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to add recipe: ${error.message}`);
    }
  });

  // Delete recipe mutation
  const deleteRecipeMutation = useMutation({
    mutationFn: async (recipeId: string) => {
      if (!selectedProduct) throw new Error('No product selected');

      // First, delete the recipe
      const { error } = await supabase
        .from('product_recipes')
        .delete()
        .eq('id', recipeId);

      if (error) throw error;

      // Fetch remaining recipes to recalculate price
      const { data: remainingRecipes, error: recipesError } = await supabase
        .from('product_recipes')
        .select(`
          quantity_required,
          component:products!component_id (
            price
          )
        `)
        .eq('finished_product_id', selectedProduct.id);

      if (recipesError) throw recipesError;

      // Calculate new total cost
      const totalCost = (remainingRecipes as unknown as { quantity_required: number; component: { price: number } }[])
        .reduce((sum, recipe) => {
          return sum + (recipe.quantity_required * Number(recipe.component.price));
        }, 0);

      // Add 30% markup for profit
      const finalPrice = totalCost * 1.3;

      // Update the finished product's price
      const { error: updateError } = await supabase
        .from('products')
        .update({ price: finalPrice })
        .eq('id', selectedProduct.id);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes', selectedProduct?.id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Recipe deleted successfully and product price updated');
    },
    onError: (error) => {
      toast.error(`Failed to delete recipe: ${error.message}`);
    }
  });

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setSelectedComponent(null);
  };

  const handleComponentSelect = (component: Product) => {
    setSelectedComponent(component);
  };

  const handleAddRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !selectedComponent) {
      toast.error('Please select both a finished product and a component');
      return;
    }
    addRecipeMutation.mutate();
  };

  const handleDeleteRecipe = (recipeId: string) => {
    deleteRecipeMutation.mutate(recipeId);
  };

  const resetForm = () => {
    setSelectedComponent(null);
    setQuantityRequired(1);
  };

  const finishedProducts = products.filter(
    product => product.product_type === 'finished'
  );

  const components = products.filter(
    product => product.product_type === 'component'
  );

  const filteredFinishedProducts = finishedProducts.filter(
    product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <ListPlus className="h-6 w-6 text-pos-primary" />
          Recipe Management
        </h1>
        <p className="text-gray-600 mt-1">Define how finished products are made from components</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Finished Products Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Finished Product</h2>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search finished products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredFinishedProducts.map(product => (
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

        {/* Recipe Management */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {selectedProduct ? (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Recipe for {selectedProduct.name}
              </h2>

              {/* Add New Component Form */}
              <form onSubmit={handleAddRecipe} className="mb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Component
                  </label>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {components.map(component => (
                      <div
                        key={component.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedComponent?.id === component.id
                            ? 'bg-pos-primary/10 border border-pos-primary'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                        onClick={() => handleComponentSelect(component)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-800">{component.name}</p>
                            <p className="text-sm text-gray-500">SKU: {component.sku}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-pos-primary">${component.price.toFixed(2)}</p>
                            <p className="text-sm text-gray-500">Stock: {component.stock}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity Required
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={quantityRequired}
                    onChange={(e) => setQuantityRequired(parseInt(e.target.value) || 0)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-pos-primary hover:bg-pos-secondary"
                  disabled={addRecipeMutation.isPending}
                >
                  {addRecipeMutation.isPending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Component to Recipe
                    </>
                  )}
                </Button>
              </form>

              {/* Current Recipe Components */}
              <div>
                <h3 className="text-md font-medium text-gray-800 mb-3">Current Recipe</h3>
                {isLoadingRecipes ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pos-primary"></div>
                  </div>
                ) : recipes.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No components added to this recipe yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recipes.map(recipe => (
                      <div
                        key={recipe.id}
                        className="p-3 bg-gray-50 rounded-lg flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium text-gray-800">{recipe.component.name}</p>
                          <p className="text-sm text-gray-500">
                            Required: {recipe.quantity_required} units
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRecipe(recipe.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>Select a finished product to manage its recipe</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeManagement; 