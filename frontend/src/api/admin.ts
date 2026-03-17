import api from './client';
import type { User, Order } from '../types';

export const getDashboard = async (): Promise<{
  products: number;
  users: number;
  orders: number;
  subscriptions: number;
}> => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

export const getUsers = async (
  page = 1,
  limit = 20
): Promise<{ users: User[]; total: number }> => {
  const response = await api.get(`/admin/users?page=${page}&limit=${limit}`);
  return response.data;
};

export const getUser = async (id: number): Promise<User> => {
  const response = await api.get(`/admin/users/${id}`);
  return response.data;
};

export const updateUser = async (
  id: number,
  data: Partial<User>
): Promise<User> => {
  const response = await api.put(`/admin/users/${id}`, data);
  return response.data;
};

export const getOrders = async (
  page = 1,
  limit = 20
): Promise<{ orders: Order[]; total: number }> => {
  const response = await api.get(`/admin/orders?page=${page}&limit=${limit}`);
  return response.data;
};

export const getOrder = async (id: number): Promise<Order> => {
  const response = await api.get(`/admin/orders/${id}`);
  return response.data;
};

export const getSubscriptions = async (): Promise<{
  subscriptions: { id: number; status: string; user: User }[];
}> => {
  const response = await api.get('/admin/subscriptions');
  return response.data;
};