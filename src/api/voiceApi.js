import { api } from './client';
export const voiceApi = {
  textToSpeech: async (data, token) => {
    const blob = await api.post('/voice/text-to-speech', data, token);
    return URL.createObjectURL(blob);
  },
};
