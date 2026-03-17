import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from 'react';
import type { CartItem } from '../types';
import { getCart, addToCart as apiAddToCart, removeFromCart, updateCartItem as apiUpdateCartItem, clearCart as apiClearCart } from '../api/cart';

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  updateItem: (id: number, quantity: number) => Promise<void>;
  clear: () => Promise<void>;
  total: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoading(true);
    try {
      const data = await getCart();
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId: number, quantity: number) => {
    await apiAddToCart(productId, quantity);
    await fetchCart();
  };

  const removeItem = async (id: number) => {
    await removeFromCart(id);
    await fetchCart();
  };

  const updateItem = async (id: number, quantity: number) => {
    await apiUpdateCartItem(id, quantity);
    await fetchCart();
  };

  const clear = async () => {
    await apiClearCart();
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.quantity * item.product.price, 0);

  return (
    <CartContext.Provider value={{ items, loading, addToCart, removeItem, updateItem, clear, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}