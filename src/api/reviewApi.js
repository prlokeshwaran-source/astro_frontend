import { api } from './client';
export const reviewApi = { create: (data, token) => api.post('/reviews', data, token), forAstrologer: (id) => api.get(`/reviews/${encodeURIComponent(id)}`) };
