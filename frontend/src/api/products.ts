import api from './client';
import type { Product, PaginatedResponse } from '../types';

export const getProducts = async (
  page = 1,
  limit = 20,
  category?: string
): Promise<PaginatedResponse<Product>> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (category) params.append('category', category);
  const response = await api.get(`/products?${params}`);
  return response.data;
};

export const getProduct = async (id: number): Promise<Product> => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (data: Partial<Product>): Promise<Product> => {
  const response = await api.post('/admin/products', data);
  return response.data;
};

export const updateProduct = async (id: number, data: Partial<Product>): Promise<Product> => {
  const response = await api.put(`/admin/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await api.delete(`/admin/products/${id}`);
};