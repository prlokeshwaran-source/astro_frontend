import { api } from './client';
export const voiceApi = {
  astrologyAnswer: (data, token) => api.post('/voice/astrology-answer', data, token),
  textToSpeech: async (data, token) => {
    const blob = await api.post('/voice/text-to-speech', data, token);
    return URL.createObjectURL(blob);
  },
};
