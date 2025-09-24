import axios from 'axios';
import { ApiResponse } from '../types';

// API para backend CakePHP
export const backendApi = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: false,
});

// API para consulta de CEP
export const cepApi = axios.create({
  baseURL: 'https://viacep.com.br/ws',
  timeout: 5000,
  headers: {
    'Accept': 'application/json',
  },
});

// Interceptors para tratar respostas
backendApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Backend API Error:', error);
    return Promise.reject(error);
  }
);

cepApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('CEP API Error:', error);
    return Promise.reject(error);
  }
);

// Helper para tratar respostas da API
export const handleApiResponse = <T>(response: any): ApiResponse<T> => {
  if (response.data && typeof response.data === 'object') {
    return response.data;
  }

  return {
    success: true,
    data: response.data,
  };
};

// Helper para tratar erros da API
export const handleApiError = (error: any): ApiResponse => {
  if (error.response?.data) {
    return error.response.data;
  }

  return {
    success: false,
    message: error.message || 'Erro desconhecido',
    error: 'NETWORK_ERROR',
  };
};