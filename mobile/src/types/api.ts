export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  nombre: string;
}

export interface LoginResponse {
  access_token: string;
  user: UserProfile;
}

export type OrderStatus = 'PENDIENTE' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO';

export interface OrderItem {
  id: string;
  estado: OrderStatus;
  notasPedido?: string | null;
  customerId?: string;
  assignedUserId?: string;
  customer?: {
    id: string;
    nombre: string;
    telefono: string | null;
    direccionEntrega: string;
  };
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  lat: number;
  lng: number;
}

export interface OrderTrackingEvent {
  orderId: string;
  previousStatus: OrderStatus;
  newStatus: OrderStatus;
  location: {
    lat: number;
    lng: number;
  };
  timestamp: string;
}

export interface OrderHistoryResponse {
  order: OrderItem & {
    createdAt: string;
    updatedAt: string;
  };
  events: OrderTrackingEvent[];
}
