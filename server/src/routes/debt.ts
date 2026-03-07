import express from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../prisma';
import { DebtService } from '../services/debt.service';
import { DebtStatus } from '@calorielens/shared';

const router = express.Router();

const createDebtSchema = z.object({
  overageCalories: z.number().positive(),
  paybackDays: z.number().int().min(1).max(30),
  startDate: z.string().optional()
});

// Create new debt
router.post('/create', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const data = createDebtSchema.parse(req.body);
    
    const profile = await prisma.profile.findUnique({
      where: { userId: req.userId }
    });
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    const debt = await DebtService.createDebt(
      req.userId,
      data,
      profile.sex,
      profile.baseTargetCalories
    );
    
    res.status(201).json(debt);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Create debt error:', error);
    res.status(500).json({ error: 'Failed to create debt' });
  }
});

// Get debt status
router.get('/status', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const status = await DebtService.getDebtStatus(req.userId);
    res.json(status);
  } catch (error) {
    console.error('Get debt status error:', error);
    res.status(500).json({ error: 'Failed to get debt status' });
  }
});

// Cancel/complete debt
router.delete('/:debtId', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { debtId } = req.params;
    
    // Verify debt belongs to user
    const debt = await prisma.debt.findFirst({
      where: { id: debtId, userId: req.userId }
    });
    
    if (!debt) {
      return res.status(404).json({ error: 'Debt not found' });
    }
    
    await prisma.debt.update({
      where: { id: debtId },
      data: { status: 'completed' }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete debt error:', error);
    res.status(500).json({ error: 'Failed to delete debt' });
  }
});

export default router;
