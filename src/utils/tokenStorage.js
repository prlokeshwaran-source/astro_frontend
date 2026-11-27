const KEY = 'astro.session';
export const tokenStorage = {
  read: () => { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; } },
  write: (tokens) => localStorage.setItem(KEY, JSON.stringify(tokens)),
  clear: () => localStorage.removeItem(KEY),
};
