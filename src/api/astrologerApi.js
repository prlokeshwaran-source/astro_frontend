import { api } from './client';
export const astrologerApi = {
  search: (filters = {}) => api.get(`/astrologers?${new URLSearchParams(Object.entries(filters).filter(([, v]) => v !== '' && v != null))}`),
  apply: (data, token) => api.post('/astrologers/apply', data, token),
  me: (token) => api.get('/astrologers/me', token),
  updateMe: (data, token) => api.patch('/astrologers/me', data, token),
};
