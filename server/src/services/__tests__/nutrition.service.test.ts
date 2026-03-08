import { NutritionService } from '../nutrition.service';
import { OnboardingData } from '../shared-types';

describe('NutritionService', () => {
  describe('calculateBMR', () => {
    it('should calculate BMR correctly for males', () => {
      const data: OnboardingData = {
        sex: 'male',
        age: 30,
        heightCm: 180,
        weightKg: 80,
        activityLevel: 'moderate',
        goalRateKgPerWeek: 0.5
      };
      
      const bmr = NutritionService.calculateBMR(data);
      // (10 * 80) + (6.25 * 180) - (5 * 30) + 5 = 800 + 1125 - 150 + 5 = 1780
      expect(bmr).toBe(1780);
    });

    it('should calculate BMR correctly for females', () => {
      const data: OnboardingData = {
        sex: 'female',
        age: 25,
        heightCm: 165,
        weightKg: 60,
        activityLevel: 'light',
        goalRateKgPerWeek: 0.5
      };
      
      const bmr = NutritionService.calculateBMR(data);
      // (10 * 60) + (6.25 * 165) - (5 * 25) - 161 = 600 + 1031.25 - 125 - 161 = 1345
      expect(bmr).toBe(1345);
    });
  });

  describe('calculateTDEE', () => {
    it('should calculate TDEE with sedentary multiplier', () => {
      const bmr = 1500;
      const tdee = NutritionService.calculateTDEE(bmr, 'sedentary');
      expect(tdee).toBe(1800); // 1500 * 1.2
    });

    it('should calculate TDEE with moderate multiplier', () => {
      const bmr = 1500;
      const tdee = NutritionService.calculateTDEE(bmr, 'moderate');
      expect(tdee).toBe(2325); // 1500 * 1.55
    });

    it('should calculate TDEE with very active multiplier', () => {
      const bmr = 2000;
      const tdee = NutritionService.calculateTDEE(bmr, 'very_active');
      expect(tdee).toBe(3800); // 2000 * 1.9
    });
  });

  describe('calculateDeficit', () => {
    it('should calculate daily deficit for 0.5kg/week goal', () => {
      const deficit = NutritionService.calculateDeficit(0.5);
      // 0.5 * 7700 / 7 = 550
      expect(deficit).toBe(550);
    });

    it('should calculate daily deficit for 1kg/week goal', () => {
      const deficit = NutritionService.calculateDeficit(1);
      // 1 * 7700 / 7 = 1100
      expect(deficit).toBe(1100);
    });

    it('should calculate daily deficit for 0.25kg/week goal', () => {
      const deficit = NutritionService.calculateDeficit(0.25);
      // 0.25 * 7700 / 7 = 275
      expect(deficit).toBe(275);
    });
  });

  describe('calculateTargetCalories', () => {
    it('should return target without warning when safe', () => {
      const result = NutritionService.calculateTargetCalories(2000, 500, 'male');
      expect(result.target).toBe(1500);
      expect(result.warning).toBeUndefined();
    });

    it('should enforce minimum for females', () => {
      const result = NutritionService.calculateTargetCalories(1500, 500, 'female');
      expect(result.target).toBe(1200);
      expect(result.warning).toBeDefined();
      expect(result.warning).toContain('1200');
    });

    it('should enforce minimum for males', () => {
      const result = NutritionService.calculateTargetCalories(1800, 500, 'male');
      expect(result.target).toBe(1500);
      expect(result.warning).toBeDefined();
      expect(result.warning).toContain('1500');
    });
  });

  describe('calculateMacros', () => {
    it('should calculate macros correctly for 100g', () => {
      const macros = NutritionService.calculateMacros(100, 165, 31, 0, 3.6);
      expect(macros.calories).toBe(165);
      expect(macros.protein).toBe(31);
      expect(macros.carbs).toBe(0);
      expect(macros.fat).toBe(3.6);
    });

    it('should calculate macros correctly for 150g', () => {
      const macros = NutritionService.calculateMacros(150, 165, 31, 0, 3.6);
      expect(macros.calories).toBe(248); // 165 * 1.5 = 247.5 -> 248
      expect(macros.protein).toBe(46.5);
      expect(macros.carbs).toBe(0);
      expect(macros.fat).toBe(5.4);
    });

    it('should calculate macros correctly for 50g', () => {
      const macros = NutritionService.calculateMacros(50, 200, 20, 10, 5);
      expect(macros.calories).toBe(100);
      expect(macros.protein).toBe(10);
      expect(macros.carbs).toBe(5);
      expect(macros.fat).toBe(2.5);
    });
  });
});
