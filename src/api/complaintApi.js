import { api } from './client';
export const complaintApi = {
  create: (data, token) => api.post('/complaints', data, token),
  list: (token) => api.get('/complaints', token),
  update: (id, status, notes, token) => api.patch(`/complaints/${encodeURIComponent(id)}?${new URLSearchParams({ status, ...(notes ? { notes } : {}) })}`, undefined, token),
};
