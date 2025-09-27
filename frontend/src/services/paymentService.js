/ services/paymentService.js
import { apiClient } from './apiClient';

export const paymentService = {
  async createPayment(paymentData) {
    const endpoint = paymentData.method === 'stripe' ? '/stripe/checkout' : '/paypal/checkout';
    
    const response = await apiClient.post(endpoint, {
      event_id: paymentData.event_id,
      quantity: paymentData.quantity
    });

    return response.data;
  },

  async getPaymentStatus(sessionId, paymentId) {
    const params = new URLSearchParams();
    if (sessionId) params.append('session_id', sessionId);
    if (paymentId) params.append('payment_id', paymentId);

    const response = await apiClient.get(`/payment/status?${params}`);
    return response.data;
  }
};

// services/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { apiClient };