import express from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../prisma';

const router = express.Router();

const createSchema = z.object({
  name: z.string().min(1).max(100),
  caloriesPer100g: z.number().min(0).max(9000),
  proteinPer100g: z.number().min(0).max(100).default(0),
  carbsPer100g: z.number().min(0).max(100).default(0),
  fatPer100g: z.number().min(0).max(100).default(0),
  defaultServingG: z.number().min(1).max(2000).default(100),
});

// GET /saved-foods
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
    const foods = await prisma.savedFood.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(foods);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch saved foods' });
  }
});

// POST /saved-foods
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
    const data = createSchema.parse(req.body);
    const food = await prisma.savedFood.create({
      data: { userId: req.userId, ...data },
    });
    res.status(201).json(food);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Failed to save food' });
  }
});

// DELETE /saved-foods/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
    const food = await prisma.savedFood.findUnique({ where: { id: req.params.id } });
    if (!food || food.userId !== req.userId) {
      return res.status(404).json({ error: 'Not found' });
    }
    await prisma.savedFood.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete saved food' });
  }
});

export default router;
