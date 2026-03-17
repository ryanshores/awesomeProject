import api from './client';
import type { AuthResponse, User } from '../types';

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (
  email: string,
  password: string,
  first_name: string,
  last_name: string
): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', {
    email,
    password,
    first_name,
    last_name,
  });
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get('/auth/me');
  return response.data;
};