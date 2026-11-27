import { api } from './client';
export const adminApi = {
  dashboard: (token) => api.get('/admin/dashboard', token),
  pendingAstrologers: (token) => api.get('/admin/astrologers/pending', token),
  approveAstrologer: (id, status, token) => api.patch(`/admin/astrologers/${encodeURIComponent(id)}/approval?status=${encodeURIComponent(status)}`, undefined, token),
  users: (token) => api.get('/admin/users', token),
  setUserActive: (id, enabled, token) => api.patch(`/admin/users/${encodeURIComponent(id)}/active?enabled=${enabled}`, undefined, token),
};
