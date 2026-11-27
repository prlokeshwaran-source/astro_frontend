import { api } from './client';

export const callApi = {
  start: (consultation_id, token) => api.post('/calls/start', { consultation_id }, token),
  end: (callId, token) => api.post(`/calls/${encodeURIComponent(callId)}/end`, undefined, token),
};
