import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import type {
  RegisterRequest, LoginRequest, AuthResponse, OnboardingData, OnboardingResult,
  UserProfile, Meal, CreateMealRequest, DailySummary, WeeklySummary,
  FoodItem, CreateDebtRequest, Debt, DebtStatus, FoodDetectionResult, MealItemInput,
  SavedFood, CreateSavedFoodRequest
} from '../types/shared-types';

const API_BASE = 'https://calorielensserver-production.up.railway.app/api';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', data).then(r => r.data),
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data).then(r => r.data),
};

export const profileApi = {
  create: (data: OnboardingData) =>
    api.post<OnboardingResult>('/profile', data).then(r => r.data),
  get: () =>
    api.get<UserProfile>('/profile').then(r => r.data),
  update: (data: OnboardingData) =>
    api.post<OnboardingResult>('/profile', data).then(r => r.data),
};

export const mealApi = {
  create: (data: FormData | CreateMealRequest) => {
    if (data instanceof FormData) {
      return api.post<Meal>('/meals', data).then(r => r.data);
    }
    return api.post<Meal>('/meals', data).then(r => r.data);
  },
  analyzePhoto: (base64: string, mimeType: string) =>
    api.post<FoodDetectionResult>('/meals/analyze-photo-base64', { base64, mimeType }).then(r => r.data),
  getById: (mealId: string) =>
    api.get<Meal>(`/meals/${mealId}`).then(r => r.data),
  update: (mealId: string, data: { mealType: string; items: MealItemInput[] }) =>
    api.put<Meal>(`/meals/${mealId}`, data).then(r => r.data),
  delete: (mealId: string) =>
    api.delete(`/meals/${mealId}`).then(r => r.data),
};

export const summaryApi = {
  getByDate: (date: string) =>
    api.get<DailySummary>('/summary/today', { params: { date } }).then(r => r.data),
  getWeek: () =>
    api.get<WeeklySummary>('/summary/week').then(r => r.data),
};

export const foodApi = {
  search: (query: string, limit = 300) =>
    api.get<FoodItem[]>('/food/search', { params: { q: query, limit } }).then(r => r.data),
  usdaSearch: (query: string) =>
    api.get<(FoodItem & { source: string })[]>('/food/usda-search', { params: { q: query } }).then(r => r.data),
};

export const debtApi = {
  create: (data: CreateDebtRequest) =>
    api.post<Debt>('/debt/create', data).then(r => r.data),
  getStatus: () =>
    api.get<DebtStatus>('/debt/status').then(r => r.data),
  cancel: (debtId: string) =>
    api.delete(`/debt/${debtId}`).then(r => r.data),
};

export const savedFoodsApi = {
  list: () =>
    api.get<SavedFood[]>('/saved-foods').then(r => r.data),
  create: (data: CreateSavedFoodRequest) =>
    api.post<SavedFood>('/saved-foods', data).then(r => r.data),
  delete: (id: string) =>
    api.delete(`/saved-foods/${id}`).then(r => r.data),
};

export default api;
