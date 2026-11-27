import { api } from './client';
export const consultationApi = {
  create: (data, token) => api.post('/consultations', data, token),
  list: (page = 1, pageSize = 20, token) => api.get(`/consultations?page=${page}&page_size=${pageSize}`, token),
  update: (id, data, token) => api.patch(`/consultations/${encodeURIComponent(id)}`, data, token),
};
