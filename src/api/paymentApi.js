import { api } from './client';
export const paymentApi = {
  create: (data, token) => api.post('/payments', data, token),
  mine: (token) => api.get('/payments/mine', token),
  updateStatus: (id, status, token) => api.patch(`/payments/${encodeURIComponent(id)}/status?status=${encodeURIComponent(status)}`, undefined, token),
};
