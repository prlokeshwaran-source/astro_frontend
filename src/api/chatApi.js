import { api, websocketUrl } from './client';
export const chatApi = {
  messages: (id, token) => api.get(`/chat/${encodeURIComponent(id)}/messages`, token),
  send: (id, data, token) => api.post(`/chat/${encodeURIComponent(id)}/messages`, data, token),
  attachment: (consultationId, messageId, token) => api.get(
    `/chat/${encodeURIComponent(consultationId)}/messages/${encodeURIComponent(messageId)}/attachment`,
    token,
  ),
  connect: (id, token) => new WebSocket(websocketUrl(`/ws/chat/${encodeURIComponent(id)}`, token)),
};
