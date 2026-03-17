import api from './client';
import type { CartItem } from '../types';

export const getCart = async (): Promise<CartItem[]> => {
  const response = await api.get('/cart');
  return response.data;
};

export const addToCart = async (productId: number, quantity: number): Promise<CartItem> => {
  const response = await api.post('/cart', { product_id: productId, quantity });
  return response.data;
};

export const updateCartItem = async (id: number, quantity: number): Promise<CartItem> => {
  const response = await api.put(`/cart/${id}`, { product_id: 0, quantity });
  return response.data;
};

export const removeFromCart = async (id: number): Promise<void> => {
  await api.delete(`/cart/${id}`);
};

export const clearCart = async (): Promise<void> => {
  await api.delete('/cart');
};