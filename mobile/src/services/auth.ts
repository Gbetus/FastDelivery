import { apiRequest } from './api';
import type { LoginRequest, LoginResponse, UserProfile } from '../types/api';

export function login(input: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/deliverer/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function fetchMe(token: string): Promise<UserProfile> {
  return apiRequest<UserProfile>('/auth/me', {
    method: 'GET',
    token,
  });
}
