import { api } from './client';

export const locationApi = {
  search: (query, language, signal) => api.get(
    `/locations/search?${new URLSearchParams({ q: query, language })}`,
    undefined,
    { signal },
  ),
};
