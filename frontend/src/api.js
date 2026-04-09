import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// ── Axios instance with JWT interceptor ─────────────────────
const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('electra_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Data endpoints (unchanged) ──────────────────────────────
export const fetchData = () => api.get('/data').then(res => res.data);
export const fetchForecast = () => api.get('/forecast').then(res => res.data);
export const fetchPatterns = () => api.get('/patterns').then(res => res.data);
export const fetchAnomalies = () => api.get('/anomalies').then(res => res.data);
export const fetchResults = () => api.get('/results').then(res => res.data);

// ── Auth endpoints ──────────────────────────────────────────
export const registerUser = (data) =>
  api.post('/register', data).then(res => res.data);

export const loginUser = (data) =>
  api.post('/login', data).then(res => res.data);

export const fetchProfile = () =>
  api.get('/me').then(res => res.data);

export const updateProfile = (data) =>
  api.put('/me', data).then(res => res.data);

// ── Settings & Alerts ───────────────────────────────────────
export const fetchSettings = () =>
  api.get('/settings').then(res => res.data);

export const updateSettings = (data) =>
  api.put('/settings', data).then(res => res.data);

export const fetchActiveAlerts = () =>
  api.get('/alerts').then(res => res.data);

export const fetchBillStatus = () =>
  api.get('/bill-status').then(res => res.data);
