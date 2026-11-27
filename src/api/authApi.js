import { api } from './client';
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  refresh: (refreshToken) => api.post('/auth/refresh', { refresh_token: refreshToken }),
  logout: (refreshToken, token) => api.post('/auth/logout', { refresh_token: refreshToken }, token),
  me: (token) => api.get('/auth/me', token),
};
