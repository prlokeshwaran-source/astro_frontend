import { api } from './client';
export const astrologyApi = {
  chart: (data, token, language) => api.post(`/astrology/chart${language ? `?language=${encodeURIComponent(language)}` : ''}`, data, token),
};
