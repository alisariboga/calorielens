import { OnboardingData, OnboardingResult } from '../shared-types';

export class NutritionService {
  /**
   * Calculate BMR using Mifflin-St Jeor equation
   * Men: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
   * Women: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
   */
  static calculateBMR(data: OnboardingData): number {
    const { sex, age, heightCm, weightKg } = data;
    
    const baseBMR = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
    const bmr = sex === 'male' ? baseBMR + 5 : baseBMR - 161;
    
    return Math.round(bmr);
  }

  /**
   * Calculate TDEE (Total Daily Energy Expenditure) based on activity level
   */
  static calculateTDEE(bmr: number, activityLevel: string): number {
    const multipliers: Record<string, number> = {
      sedentary: 1.2,      // Little or no exercise
      light: 1.375,        // Light exercise 1-3 days/week
      moderate: 1.55,      // Moderate exercise 3-5 days/week
      active: 1.725,       // Heavy exercise 6-7 days/week
      very_active: 1.9     // Very heavy exercise, physical job
    };
    
    const multiplier = multipliers[activityLevel] || 1.2;
    return Math.round(bmr * multiplier);
  }

  /**
   * Calculate daily calorie deficit for weight loss goal
   * 1 kg of fat = approximately 7700 calories
   */
  static calculateDeficit(goalRateKgPerWeek: number): number {
    const caloriesPerKg = 7700;
    const dailyDeficit = (goalRateKgPerWeek * caloriesPerKg) / 7;
    return Math.round(dailyDeficit);
  }

  /**
   * Calculate target daily calories with safety checks
   */
  static calculateTargetCalories(
    tdee: number,
    deficit: number,
    sex: string
  ): { target: number; warning?: string } {
    const minCalories = sex === 'female' ? 1200 : 1500;
    const target = tdee - deficit;
    
    if (target < minCalories) {
      return {
        target: minCalories,
        warning: `Target adjusted to safe minimum of ${minCalories} calories for ${sex}s. Your goal may take longer than expected.`
      };
    }
    
    return { target: Math.round(target) };
  }

  /**
   * Calculate macros from food quantity and per-100g values
   */
  static calculateMacros(
    quantityG: number,
    caloriesPer100g: number,
    proteinPer100g: number,
    carbsPer100g: number,
    fatPer100g: number
  ) {
    const factor = quantityG / 100;
    
    return {
      calories: Math.round(caloriesPer100g * factor),
      protein: Math.round(proteinPer100g * factor * 10) / 10,
      carbs: Math.round(carbsPer100g * factor * 10) / 10,
      fat: Math.round(fatPer100g * factor * 10) / 10
    };
  }
}
