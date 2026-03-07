import express from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../prisma';
import { NutritionService } from '../services/nutrition.service';
import { OnboardingData, OnboardingResult, UserProfile } from '@calorielens/shared';

const router = express.Router();

const onboardingSchema = z.object({
  sex: z.enum(['male', 'female']),
  age: z.number().int().min(13).max(120),
  heightCm: z.number().min(100).max(250),
  weightKg: z.number().min(30).max(300),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  goalRateKgPerWeek: z.number().min(0.25).max(1)
});

// Create/update profile (onboarding)
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const data = onboardingSchema.parse(req.body) as OnboardingData;
    
    // Calculate BMR, TDEE, and target
    const bmr = NutritionService.calculateBMR(data);
    const tdee = NutritionService.calculateTDEE(bmr, data.activityLevel);
    const deficit = NutritionService.calculateDeficit(data.goalRateKgPerWeek);
    const { target, warning } = NutritionService.calculateTargetCalories(tdee, deficit, data.sex);
    
    // Create or update profile
    const profile = await prisma.profile.upsert({
      where: { userId: req.userId },
      create: {
        userId: req.userId,
        sex: data.sex,
        age: data.age,
        heightCm: data.heightCm,
        weightKg: data.weightKg,
        activityLevel: data.activityLevel,
        goalRateKgPerWeek: data.goalRateKgPerWeek,
        bmr,
        tdee,
        baseTargetCalories: target
      },
      update: {
        sex: data.sex,
        age: data.age,
        heightCm: data.heightCm,
        weightKg: data.weightKg,
        activityLevel: data.activityLevel,
        goalRateKgPerWeek: data.goalRateKgPerWeek,
        bmr,
        tdee,
        baseTargetCalories: target
      }
    });
    
    const result: OnboardingResult = {
      bmr,
      tdee,
      deficit,
      targetCalories: target,
      profile: {
        userId: profile.userId,
        sex: profile.sex as 'male' | 'female',
        age: profile.age,
        heightCm: profile.heightCm,
        weightKg: profile.weightKg,
        activityLevel: profile.activityLevel as any,
        goalRateKgPerWeek: profile.goalRateKgPerWeek,
        bmr: profile.bmr,
        tdee: profile.tdee,
        baseTargetCalories: profile.baseTargetCalories,
        updatedAt: profile.updatedAt
      }
    };
    
    if (warning) {
      res.json({ ...result, warning });
    } else {
      res.json(result);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Profile creation error:', error);
    res.status(500).json({ error: 'Failed to create profile' });
  }
});

// Get profile
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const profile = await prisma.profile.findUnique({
      where: { userId: req.userId }
    });
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    const result: UserProfile = {
      userId: profile.userId,
      sex: profile.sex as 'male' | 'female',
      age: profile.age,
      heightCm: profile.heightCm,
      weightKg: profile.weightKg,
      activityLevel: profile.activityLevel as any,
      goalRateKgPerWeek: profile.goalRateKgPerWeek,
      bmr: profile.bmr,
      tdee: profile.tdee,
      baseTargetCalories: profile.baseTargetCalories,
      updatedAt: profile.updatedAt
    };
    
    res.json(result);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

export default router;
