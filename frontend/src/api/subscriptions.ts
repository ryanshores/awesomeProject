import api from './client';
import type { CheckoutSession, Subscription, SubscriptionPlan } from '../types';

export const getPlans = async (): Promise<SubscriptionPlan[]> => {
  const response = await api.get('/subscriptions/plans');
  return response.data;
};

export const getPlan = async (id: number): Promise<SubscriptionPlan> => {
  const response = await api.get(`/subscriptions/plans/${id}`);
  return response.data;
};

export const createPlan = async (data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> => {
  const response = await api.post('/admin/subscriptions/plans', data);
  return response.data;
};

export const updatePlan = async (
  id: number,
  data: Partial<SubscriptionPlan>
): Promise<SubscriptionPlan> => {
  const response = await api.put(`/admin/subscriptions/plans/${id}`, data);
  return response.data;
};

export const deletePlan = async (id: number): Promise<void> => {
  await api.delete(`/admin/subscriptions/plans/${id}`);
};

export const getUserSubscriptions = async (): Promise<Subscription[]> => {
  const response = await api.get('/subscriptions');
  return response.data;
};

export const createCheckoutSession = async (
  successUrl: string,
  cancelUrl: string
): Promise<CheckoutSession> => {
  const response = await api.post('/checkout/session', {
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
  return response.data;
};

export const createSubscriptionSession = async (
  planId: number,
  successUrl: string,
  cancelUrl: string
): Promise<CheckoutSession> => {
  const response = await api.post('/checkout/subscription', {
    plan_id: planId,
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
  return response.data;
};