import axios from 'axios';

const API_URL = import.meta.env.PROD ? (import.meta.env.VITE_API_URL || '') : 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getSummary = (params) => apiClient.get('/api/summary', { params });
export const getRevenueByCategory = (params) => apiClient.get('/api/revenue-by-category', { params });
export const getRevenueOverTime = (params) => apiClient.get('/api/revenue-over-time', { params });
export const getFilters = () => apiClient.get('/api/filters');
export const getOrders = (params) => apiClient.get('/api/orders', { params });
export const getTopSellers = (params) => apiClient.get('/api/top-sellers', { params });
export const getPaymentMethods = (params) => apiClient.get('/api/payment-methods', { params });
export const getHeatmap = (params) => apiClient.get('/api/heatmap', { params });

export const getExportUrl = (filters) => {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key]) params.append(key, filters[key]);
  });
  return `${API_URL}/api/export?${params.toString()}`;
};

export const login = (username, password) => {
  return axios.post(`${API_URL}/api/login`, { username, password });
};
