import axios from 'axios';

const api = axios.create({ baseURL: '/api/v1' });

export const getTokens = () => JSON.parse(localStorage.getItem('cloudstack_tokens') || 'null');
export const setTokens = (tokens) => localStorage.setItem('cloudstack_tokens', JSON.stringify(tokens));
export const clearTokens = () => localStorage.removeItem('cloudstack_tokens');

api.interceptors.request.use((config) => {
  const tokens = getTokens();
  if (tokens?.access_token) config.headers.Authorization = `Bearer ${tokens.access_token}`;
  return config;
});

let refreshPromise;
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    const tokens = getTokens();
    if (error.response?.status !== 401 || request?._retried || !tokens?.refresh_token) return Promise.reject(error);
    request._retried = true;
    try {
      refreshPromise ??= axios.post('/api/v1/auth/refresh', { refresh_token: tokens.refresh_token });
      const { data } = await refreshPromise;
      setTokens(data);
      request.headers.Authorization = `Bearer ${data.access_token}`;
      return api(request);
    } catch (refreshError) {
      clearTokens();
      return Promise.reject(refreshError);
    } finally {
      refreshPromise = undefined;
    }
  },
);

export default api;
