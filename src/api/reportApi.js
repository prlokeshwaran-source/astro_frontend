import { api } from './client';
export const reportApi = {
  create: (data, token) => api.post('/reports', data, token),
  generate: (data, token) => api.post('/reports/generate', data, token),
  share: (id, token) => api.post(`/reports/${encodeURIComponent(id)}/share`, {}, token),
  pdf: (id, token) => api.get(`/reports/${encodeURIComponent(id)}/pdf`, token),
  list: (token) => api.get('/reports', token),
};
