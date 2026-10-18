export interface CartProduct {
  productId: number;
  quantity: number;
}

export interface Cart {
  id: number;
  userId: number;
  date?: string;
  products: CartProduct[];
}

export interface CartDetailedProduct {
  productId: number;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  total: number;
}

export interface CartDetail {
  id: number;
  userId: number;
  date?: string;
  products: CartDetailedProduct[];
  totalAmount: number;
  totalItems: number;
}
