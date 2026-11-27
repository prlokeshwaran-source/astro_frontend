const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status) { super(message); this.name = 'ApiError'; this.status = status; }
}

export async function request(path, { method = 'GET', body, token, headers = {}, signal } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    signal,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const detail = (await response.json()).detail;
      if (typeof detail === 'string') message = detail;
      else if (Array.isArray(detail)) message = detail.map((item) => {
        const field = Array.isArray(item.loc) ? item.loc.slice(1).join('.') : '';
        return `${field ? `${field}: ` : ''}${item.msg || 'Invalid value'}`;
      }).join('; ') || message;
    } catch { /* non-JSON error */ }
    throw new ApiError(message, response.status);
  }
  if (response.status === 204) return null;
  const contentType = response.headers.get('content-type') || '';
  return contentType.includes('application/json') ? response.json() : response.blob();
}

export const api = {
  get: (path, token, options) => request(path, { ...options, token }),
  post: (path, body, token, options) => request(path, { ...options, method: 'POST', body, token }),
  patch: (path, body, token, options) => request(path, { ...options, method: 'PATCH', body, token }),
  put: (path, body, token, options) => request(path, { ...options, method: 'PUT', body, token }),
  delete: (path, token, options) => request(path, { ...options, method: 'DELETE', token }),
};

export const websocketUrl = (path, token) => {
  const serverUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, '').replace(/^http/, 'ws');
  const url = new URL(`${serverUrl}${path}`);
  url.searchParams.set('token', token);
  return url.toString();
};
