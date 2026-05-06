import { apiRequest } from './api';
import type { OrderHistoryResponse, OrderItem, UpdateOrderStatusRequest } from '../types/api';

export async function fetchOrders(token: string, driverId: string): Promise<OrderItem[]> {
  return apiRequest<OrderItem[]>('/orders', {
    method: 'GET',
    token,
  });
}

export async function updateOrderStatus(
  token: string,
  orderId: string,
  payload: UpdateOrderStatusRequest,
) {
  return apiRequest(`/orders/${encodeURIComponent(orderId)}/status`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  });
}

export async function fetchOrderHistory(token: string, orderId: string) {
  return apiRequest<OrderHistoryResponse>(`/orders/${encodeURIComponent(orderId)}/history`, {
    method: 'GET',
    token,
  });
}
