import { api } from './client';
export const userApi = {
  languages: () => api.get('/languages'),
  profile: (token) => api.get('/users/me', token),
  updateProfile: (data, token) => api.patch('/users/me', data, token),
  updateLanguage: (preferred_language, token) => api.put('/users/me/language', { preferred_language }, token),
};
