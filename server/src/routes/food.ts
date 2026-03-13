import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { FoodDetectionService } from '../services/food-detection.service';

const router = express.Router();

// Search local DB foods
router.get('/search', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { q, limit } = req.query;

    const foods = await FoodDetectionService.searchFoods(
      (q as string) || '',
      limit ? parseInt(limit as string) : 300
    );

    res.json(foods);
  } catch (error) {
    console.error('Search foods error:', error);
    res.status(500).json({ error: 'Failed to search foods' });
  }
});

// Search USDA FoodData Central
router.get('/usda-search', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const apiKey = process.env.USDA_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'USDA API key not configured' });
    }

    const query = (req.query.q as string) || '';
    if (!query.trim()) {
      return res.json([]);
    }

    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&api_key=${apiKey}&pageSize=20&dataType=SR%20Legacy,Foundation,Branded`;
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(502).json({ error: 'USDA API error' });
    }

    const data = await response.json() as any;

    // Nutrient IDs: 1008=Energy, 1003=Protein, 1005=Carbs, 1004=Fat
    const NUTRIENT_ENERGY = 1008;
    const NUTRIENT_PROTEIN = 1003;
    const NUTRIENT_CARBS = 1005;
    const NUTRIENT_FAT = 1004;

    const getNutrient = (nutrients: any[], id: number): number => {
      const n = nutrients.find((n: any) => n.nutrientId === id);
      return n ? Math.round(n.value * 10) / 10 : 0;
    };

    const results = (data.foods || [])
      .map((food: any) => {
        const nutrients = food.foodNutrients || [];
        const cal = getNutrient(nutrients, NUTRIENT_ENERGY);
        if (cal === 0) return null; // skip foods with no calorie data
        return {
          id: `usda-${food.fdcId}`,
          name: food.description,
          caloriesPer100g: cal,
          proteinPer100g: getNutrient(nutrients, NUTRIENT_PROTEIN),
          carbsPer100g: getNutrient(nutrients, NUTRIENT_CARBS),
          fatPer100g: getNutrient(nutrients, NUTRIENT_FAT),
          defaultServingG: food.servingSize && food.servingSizeUnit?.toLowerCase().includes('g')
            ? Math.round(food.servingSize)
            : 100,
          source: 'usda'
        };
      })
      .filter(Boolean);

    res.json(results);
  } catch (error) {
    console.error('USDA search error:', error);
    res.status(500).json({ error: 'Failed to search USDA database' });
  }
});

export default router;
