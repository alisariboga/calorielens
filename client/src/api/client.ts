import axios from 'axios';
import type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  OnboardingData,
  OnboardingResult,
  UserProfile,
  Meal,
  CreateMealRequest,
  DailySummary,
  WeeklySummary,
  FoodItem,
  CreateDebtRequest,
  Debt,
  DebtStatus,
  FoodDetectionResult,
  MealItemInput
} from '../shared-types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', data).then(res => res.data),
  
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data).then(res => res.data),
};

export const profileApi = {
  create: (data: OnboardingData) =>
    api.post<OnboardingResult>('/profile', data).then(res => res.data),
  
  get: () =>
    api.get<UserProfile>('/profile').then(res => res.data),
  
  update: (data: OnboardingData) =>
    api.post<OnboardingResult>('/profile', data).then(res => res.data),
};

export const mealApi = {
  create: (data: FormData | CreateMealRequest) => {
    if (data instanceof FormData) {
      return api.post<Meal>('/meals', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }).then(res => res.data);
    }
    return api.post<Meal>('/meals', data).then(res => res.data);
  },
  
  parseText: (textInput: string) =>
    api.post<FoodDetectionResult>('/meals/parse-text', { textInput }).then(res => res.data),

  analyzePhoto: (photo: File) => {
    const formData = new FormData();
    formData.append('photo', photo);
    return api.post<FoodDetectionResult>('/meals/analyze-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },
  
  addItem: (mealId: string, item: MealItemInput) =>
    api.post(`/meals/${mealId}/items`, item).then(res => res.data),
  
  getByDate: (date?: string) =>
    api.get<Meal[]>('/meals', { params: { date } }).then(res => res.data),
  
  delete: (mealId: string) =>
    api.delete(`/meals/${mealId}`).then(res => res.data),
};

export const summaryApi = {
  getToday: () =>
    api.get<DailySummary>('/summary/today').then(res => res.data),

  getByDate: (date: string) =>
    api.get<DailySummary>('/summary/today', { params: { date } }).then(res => res.data),
  
  getWeek: () =>
    api.get<WeeklySummary>('/summary/week').then(res => res.data),
};

export const foodApi = {
  search: (query: string, limit?: number) =>
    api.get<FoodItem[]>('/food/search', { params: { q: query, limit } }).then(res => res.data),
};

export const debtApi = {
  create: (data: CreateDebtRequest) =>
    api.post<Debt>('/debt/create', data).then(res => res.data),
  
  getStatus: () =>
    api.get<DebtStatus>('/debt/status').then(res => res.data),
  
  cancel: (debtId: string) =>
    api.delete(`/debt/${debtId}`).then(res => res.data),
};

export default api;
