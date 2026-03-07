import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { FoodDetectionService } from '../services/food-detection.service';

const router = express.Router();

// Search foods
router.get('/search', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { q, limit } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter required' });
    }
    
    const foods = await FoodDetectionService.searchFoods(
      q as string,
      limit ? parseInt(limit as string) : 20
    );
    
    res.json(foods);
  } catch (error) {
    console.error('Search foods error:', error);
    res.status(500).json({ error: 'Failed to search foods' });
  }
});

export default router;
