// Shared types inlined from @calorielens/shared for standalone deployment

// User & Auth
export interface User {
  id: string;
  email: string;
  createdAt: Date;
}

export interface UserProfile {
  userId: string;
  sex: 'male' | 'female';
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goalRateKgPerWeek: number;
  bmr: number;
  tdee: number;
  baseTargetCalories: number;
  updatedAt: Date;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  profile?: UserProfile;
}

// Onboarding
export interface OnboardingData {
  sex: 'male' | 'female';
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goalRateKgPerWeek: number;
}

export interface OnboardingResult {
  bmr: number;
  tdee: number;
  deficit: number;
  targetCalories: number;
  profile: UserProfile;
}

// Food & Meals
export interface FoodItem {
  id: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  defaultServingG: number;
}

export interface MealItem {
  id: string;
  mealId: string;
  foodItemId: string | null;
  name: string;
  quantityG: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  userId: string;
  dateTime: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  notes: string | null;
  imagePath: string | null;
  method: 'photo' | 'text';
  createdAt: Date;
  items: MealItem[];
}

export interface CreateMealRequest {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  dateTime?: string;
  notes?: string;
  method: 'photo' | 'text';
  textInput?: string;
  items?: MealItemInput[];
}

export interface MealItemInput {
  foodItemId?: string;
  name: string;
  quantityG: number;
  caloriesPer100g?: number;
  proteinPer100g?: number;
  carbsPer100g?: number;
  fatPer100g?: number;
}

// Summaries
export interface DailySummary {
  date: string;
  targetCalories: number;
  consumedCalories: number;
  remainingCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: Meal[];
  debtPayback: number;
}

export interface WeeklySummary {
  days: Array<{
    date: string;
    targetCalories: number;
    consumedCalories: number;
  }>;
}

// Debt
export interface Debt {
  id: string;
  userId: string;
  createdDate: Date;
  totalCalories: number;
  remainingCalories: number;
  startDate: Date;
  endDate: Date;
  dailyPaybackCalories: number;
  status: 'active' | 'completed';
}

export interface CreateDebtRequest {
  overageCalories: number;
  paybackDays: number;
  startDate?: string;
}

export interface DebtStatus {
  activeDebts: Debt[];
  totalRemaining: number;
  todayPayback: number;
}

// Nutrition estimation
export interface FoodDetectionResult {
  detectedFoods: Array<{
    name: string;
    confidence: number;
    suggestedQuantityG: number;
    caloriesPer100g?: number;
    proteinPer100g?: number;
    carbsPer100g?: number;
    fatPer100g?: number;
  }>;
  needsConfirmation: boolean;
}

// Saved Foods
export interface SavedFood {
  id: string;
  userId: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  defaultServingG: number;
  createdAt: Date;
}

export interface CreateSavedFoodRequest {
  name: string;
  caloriesPer100g: number;
  proteinPer100g?: number;
  carbsPer100g?: number;
  fatPer100g?: number;
  defaultServingG?: number;
}

export interface MacroNutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
