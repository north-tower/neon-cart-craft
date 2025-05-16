
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
