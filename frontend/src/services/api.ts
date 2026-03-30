import axios from 'axios';
import type {
  AuthResponse, User, ClientListItem,
  FinancialProfile, FinancialProfileCreate, FinancialSummary,
  Report, ReportType, Notification,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),
  register: (data: { email: string; password: string; full_name: string; phone?: string; role: string; consultant_id?: number }) =>
    api.post<AuthResponse>('/auth/register', data),
  me: () => api.get<User>('/auth/me'),
};

export const clientsApi = {
  list: () => api.get<ClientListItem[]>('/clients/'),
  get: (id: number) => api.get<User>(`/clients/${id}`),
  create: (data: { email: string; password: string; full_name: string; phone?: string; role: string }) =>
    api.post<User>('/clients/', data),
  update: (id: number, data: { full_name?: string; phone?: string; email?: string }) =>
    api.put<User>(`/clients/${id}`, data),
};

export const financialApi = {
  getProfile: (userId: number) =>
    api.get<FinancialProfile>(`/financial/profile/${userId}`),
  getHistory: (userId: number) =>
    api.get<FinancialProfile[]>(`/financial/profile/${userId}/history`),
  createProfile: (userId: number, data: FinancialProfileCreate) =>
    api.post<FinancialProfile>(`/financial/profile/${userId}`, data),
  getSummary: (userId: number) =>
    api.get<FinancialSummary>(`/financial/summary/${userId}`),
};

export const reportsApi = {
  generate: (userId: number, type: ReportType) =>
    api.post<Report>('/reports/generate', { user_id: userId, type }),
  list: (userId: number) =>
    api.get<Report[]>(`/reports/user/${userId}`),
  get: (id: number) =>
    api.get<Report>(`/reports/${id}`),
  downloadPdf: (id: number) =>
    api.get(`/reports/${id}/pdf`, { responseType: 'blob' }),
};

export const notificationsApi = {
  list: (unreadOnly = false) =>
    api.get<Notification[]>(`/notifications/?unread_only=${unreadOnly}`),
  markRead: (id: number) =>
    api.post(`/notifications/${id}/read`),
  markAllRead: () =>
    api.post('/notifications/read-all'),
};

export default api;
