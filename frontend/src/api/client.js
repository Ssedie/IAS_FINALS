import axios from 'axios';
import { clearTokens, getAccess, getRefresh, notifyAuthFailure, setAccess } from './tokens';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = axios.create({ baseURL, timeout: 20000 });

api.interceptors.request.use((config) => {
  const token = getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Share one refresh request between concurrent 401s.
let refreshing = null;

export function refreshAccess() {
  if (!refreshing) {
    const refresh = getRefresh();
    if (!refresh) return Promise.reject(new Error('No refresh token'));
    refreshing = axios
      .post(`${baseURL}/auth/refresh/`, { refresh })
      .then((res) => {
        setAccess(res.data.access);
        return res.data.access;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const isAuthCall = typeof config?.url === 'string' && config.url.startsWith('/auth/');
    if (response?.status === 401 && config && !config._retried && !isAuthCall) {
      config._retried = true; // one refresh attempt only
      try {
        const token = await refreshAccess();
        config.headers.Authorization = `Bearer ${token}`;
        return api(config);
      } catch (refreshError) {
        if (refreshError.response) {
          // Refresh token rejected: the session is over.
          clearTokens();
          notifyAuthFailure();
        }
      }
    }
    return Promise.reject(error);
  },
);