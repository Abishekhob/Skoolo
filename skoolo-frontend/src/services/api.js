import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8081/api', // adjust to your backend port
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  // Only attach token if NOT a login or register request
  if (token && !config.url.includes('/auth/login') && !config.url.includes('/auth/register')) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
