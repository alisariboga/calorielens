import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../prisma';
import { DebtService } from '../services/debt.service';
import { DailySummary, WeeklySummary } from '../shared-types';

const router = express.Router();

// Get today's summary
router.get('/today', authenticate, async (req: AuthRequest, res) => {
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
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    // Get today's meals
    const meals = await prisma.meal.findMany({
      where: {
        userId: req.userId,
        dateTime: {
          gte: today,
          lte: endOfDay
        }
      },
      include: { items: true },
      orderBy: { dateTime: 'asc' }
    });
    
    // Calculate totals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    
    for (const meal of meals) {
      for (const item of meal.items) {
        totalCalories += item.calories;
        totalProtein += item.protein;
        totalCarbs += item.carbs;
        totalFat += item.fat;
      }
    }
    
    // Get debt payback for today
    const debtPayback = await DebtService.getEffectiveTarget(
      req.userId,
      today,
      profile.baseTargetCalories
    );
    
    const targetCalories = Math.round(debtPayback);
    const remainingCalories = targetCalories - totalCalories;
    
    const summary: DailySummary = {
      date: today.toISOString().split('T')[0],
      targetCalories,
      consumedCalories: Math.round(totalCalories),
      remainingCalories: Math.round(remainingCalories),
      protein: Math.round(totalProtein * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
      meals: meals as any,
      debtPayback: Math.round(profile.baseTargetCalories - targetCalories)
    };
    
    res.json(summary);
  } catch (error) {
    console.error('Get today summary error:', error);
    res.status(500).json({ error: 'Failed to get summary' });
  }
});

// Get weekly summary
router.get('/week', authenticate, async (req: AuthRequest, res) => {
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
    
    const days: WeeklySummary['days'] = [];

    // Get Monday of current week
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);

    // Monday to Sunday
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      // Get meals for this day
      const meals = await prisma.meal.findMany({
        where: {
          userId: req.userId,
          dateTime: {
            gte: date,
            lte: endOfDay
          }
        },
        include: { items: true }
      });
      
      // Calculate consumed calories
      let consumedCalories = 0;
      for (const meal of meals) {
        for (const item of meal.items) {
          consumedCalories += item.calories;
        }
      }
      
      // Get target for this day
      const targetCalories = await DebtService.getEffectiveTarget(
        req.userId,
        date,
        profile.baseTargetCalories
      );
      
      days.push({
        date: date.toISOString().split('T')[0],
        targetCalories: Math.round(targetCalories),
        consumedCalories: Math.round(consumedCalories)
      });
    }
    
    const summary: WeeklySummary = { days };
    res.json(summary);
  } catch (error) {
    console.error('Get week summary error:', error);
    res.status(500).json({ error: 'Failed to get weekly summary' });
  }
});

export default router;
