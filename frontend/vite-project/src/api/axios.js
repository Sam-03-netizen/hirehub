import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: import.meta.env.PROD ? '/api' : `${API_URL}/api`,
  withCredentials: true,
});

export default api;
