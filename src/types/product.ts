
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  sku: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

// This interface represents the raw data structure from Supabase
export interface SupabaseProduct {
  id: number;
  product_name: string;
  description?: string;
  price: number;
  category?: string;
  photo_url?: string;
  sku: string;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}
