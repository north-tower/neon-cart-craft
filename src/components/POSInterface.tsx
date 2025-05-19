import React, { useState } from 'react';
import { Product } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Banknote,
  Search,
  Package,
  X
} from 'lucide-react';

interface CartItem {
  product: Product;
  quantity: number;
}

const POSInterface: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: {
      items: CartItem[];
      totalAmount: number;
      paymentMethod: string;
    }) => {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          order_number: `ORD-${Date.now()}`,
          total_amount: orderData.totalAmount,
          payment_method: orderData.paymentMethod,
          payment_status: 'completed',
          order_status: 'completed',
          user_id: 1,
          billing_address: {},
          shipping_address: {}
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: Number(item.product.id),
        product_name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        sku: item.product.sku
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      for (const item of orderData.items) {
        const { error: updateError } = await supabase
          .from('products')
          .update({
            stock_quantity: item.product.stock - item.quantity
          })
          .eq('id', Number(item.product.id));

        if (updateError) throw updateError;
      }

      return order;
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setCart([]);
      toast.success('Order completed successfully');
      // Navigate to success page with order details
      navigate('/order-success', {
        state: {
          orderDetails: {
            order_number: order.order_number,
            total_amount: order.total_amount,
            payment_method: order.payment_method,
            items: cart.map(item => ({
              product_name: item.product.name,
              quantity: item.quantity,
              price: item.product.price
            })),
            created_at: order.created_at
          }
        }
      });
    },
    onError: (error) => {
      toast.error(`Failed to complete order: ${error.message}`);
    }
  });

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast.error('Product is out of stock');
      return;
    }
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          toast.error('Not enough stock available');
          return prevCart;
        }
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prevCart =>
      prevCart.map(item => {
        if (item.product.id === productId) {
          const newQuantity = Math.max(0, item.quantity + delta);
          if (newQuantity > item.product.stock) {
            toast.error('Not enough stock available');
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const handleCheckout = (paymentMethod: string) => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    const totalAmount = cart.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    createOrderMutation.mutate({
      items: cart,
      totalAmount,
      paymentMethod
    });
  };

  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = products.filter(
    product =>
      (selectedCategory === 'all' || product.category === selectedCategory) &&
      (product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       product.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Product Selection Panel */}
      <div className="w-2/3 p-4 flex flex-col">
        <div className="mb-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category === 'all' ? 'All Products' : category}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="col-span-3 flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pos-primary"></div>
            </div>
          ) : (
            filteredProducts.map(product => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer"
                onClick={() => addToCart(product)}
              >
                {product.image && (
                  <div className="aspect-square mb-3 rounded-lg overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <h3 className="font-medium text-gray-900">{product.name}</h3>
                <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                <div className="mt-2 flex justify-between items-center">
                  <p className="font-bold text-pos-primary">${product.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Cart Panel */}
      <div className="w-1/3 bg-white border-l flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-pos-primary" />
            <h2 className="text-xl font-bold">Current Order</h2>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Package className="h-12 w-12 mb-2" />
              <p>Your cart is empty</p>
              <p className="text-sm">Add products to start an order</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="bg-gray-50 rounded-lg p-3 mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                    <p className="text-sm text-gray-500">${item.product.price.toFixed(2)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.product.id, -1)}
                    className="h-8 w-8"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.product.id, 1)}
                    className="h-8 w-8"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <span className="ml-auto font-medium">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t p-4 bg-gray-50">
          <div className="flex justify-between text-xl font-bold mb-4">
            <span>Total:</span>
            <span className="text-pos-primary">${cartTotal.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => handleCheckout('cash')}
              disabled={cart.length === 0}
            >
              <Banknote className="h-4 w-4 mr-2" />
              Cash
            </Button>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => handleCheckout('card')}
              disabled={cart.length === 0}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Card
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POSInterface; 