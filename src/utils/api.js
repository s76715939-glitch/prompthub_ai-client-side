/**
 * Centralized API utility for decoupled Frontend & Backend requests
 */

export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

/**
 * Returns full URL for any API endpoint
 * e.g., getApiUrl('/api/auth/login') -> 'https://api.yourdomain.com/api/auth/login' (if VITE_API_URL is set)
 * or '/api/auth/login' (if relative)
 */
export const getApiUrl = (endpoint) => {
  if (!endpoint) return API_BASE;
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) return endpoint;
  const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE}${cleanPath}`;
};

/**
 * Custom fetch wrapper that automatically:
 * 1. Attaches `Authorization: Bearer <token>` from localStorage if user is authenticated
 * 2. Sets `Content-Type: application/json` header by default
 * 3. Prepends `VITE_API_URL` when deployed to a separate server
 */
export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('prompthub_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const url = getApiUrl(endpoint);

  return fetch(url, {
    ...options,
    headers
  });
};
