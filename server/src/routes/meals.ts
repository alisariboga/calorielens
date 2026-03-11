import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../prisma';
import { FoodDetectionService } from '../services/food-detection.service';
import { NutritionService } from '../services/nutrition.service';
import { Meal, MealItem } from '../shared-types';

async function estimateMacrosForItems(
  items: Array<{ name: string; quantityG: number }>
): Promise<Map<string, { caloriesPer100g: number; proteinPer100g: number; carbsPer100g: number; fatPer100g: number }>> {
  const result = new Map();
  if (!process.env.ANTHROPIC_API_KEY || items.length === 0) return result;
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const list = items.map((i, idx) => `${idx}:${i.name}`).join('\n');
    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: `For each numbered food below, provide nutritional values per 100g. Respond ONLY with a JSON array indexed by number, no markdown:
[{"caloriesPer100g": 165, "proteinPer100g": 31, "carbsPer100g": 0, "fatPer100g": 3.6}, ...]

Foods:
${list}`
      }]
    });
    const text = response.content.find(b => b.type === 'text');
    if (text && text.type === 'text') {
      const parsed: Array<{ caloriesPer100g: number; proteinPer100g: number; carbsPer100g: number; fatPer100g: number }> = JSON.parse(text.text.trim());
      items.forEach((item, idx) => {
        if (parsed[idx]) result.set(item.name, parsed[idx]);
      });
    }
  } catch (err) {
    console.error('Claude macro estimation failed:', err);
  }
  return result;
}

const router = express.Router();

// Configure multer for file uploads
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  }
});

const createMealSchema = z.object({
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  dateTime: z.string().optional(),
  notes: z.string().optional(),
  method: z.enum(['photo', 'text']),
  textInput: z.string().optional(),
  items: z.preprocess(
    (val) => typeof val === 'string' ? JSON.parse(val) : val,
    z.array(z.object({
      foodItemId: z.string().optional(),
      name: z.string(),
      quantityG: z.number(),
      caloriesPer100g: z.number().optional(),
      proteinPer100g: z.number().optional(),
      carbsPer100g: z.number().optional(),
      fatPer100g: z.number().optional()
    })).optional()
  )
});

// Create meal with photo
router.post('/', authenticate, upload.single('photo'), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const data = createMealSchema.parse(req.body);
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    
    // If items are provided, create meal with them
    if (data.items && data.items.length > 0) {
      // Pre-estimate macros for items without calorie data
      const itemsNeedingMacros = data.items.filter(i => i.caloriesPer100g == null);
      const estimatedMacros = await estimateMacrosForItems(itemsNeedingMacros);

      const meal = await prisma.meal.create({
        data: {
          userId: req.userId,
          dateTime: data.dateTime ? new Date(data.dateTime) : new Date(),
          mealType: data.mealType,
          notes: data.notes || null,
          imagePath,
          method: data.method
        }
      });
      
      // Create meal items
      for (const itemInput of data.items) {
        let macros = { calories: 0, protein: 0, carbs: 0, fat: 0 };

        if (itemInput.foodItemId) {
          const foodItem = await prisma.foodItem.findUnique({
            where: { id: itemInput.foodItemId }
          });
          if (foodItem) {
            macros = NutritionService.calculateMacros(
              itemInput.quantityG,
              foodItem.caloriesPer100g,
              foodItem.proteinPer100g,
              foodItem.carbsPer100g,
              foodItem.fatPer100g
            );
          }
        } else if (itemInput.caloriesPer100g != null) {
          macros = NutritionService.calculateMacros(
            itemInput.quantityG,
            itemInput.caloriesPer100g,
            itemInput.proteinPer100g ?? 0,
            itemInput.carbsPer100g ?? 0,
            itemInput.fatPer100g ?? 0
          );
        } else {
          // Fallback: use Claude-estimated macros
          console.log('Map keys:', JSON.stringify([...estimatedMacros.keys()]), 'Looking for:', itemInput.name);
          const estimated = estimatedMacros.get(itemInput.name);
          console.log('Estimated macros found:', JSON.stringify(estimated));
          if (estimated) {
            macros = NutritionService.calculateMacros(
              itemInput.quantityG,
              estimated.caloriesPer100g,
              estimated.proteinPer100g,
              estimated.carbsPer100g,
              estimated.fatPer100g
            );
          }
        }
        
        await prisma.mealItem.create({
          data: {
            mealId: meal.id,
            foodItemId: itemInput.foodItemId || null,
            name: itemInput.name,
            quantityG: itemInput.quantityG,
            calories: macros.calories,
            protein: macros.protein,
            carbs: macros.carbs,
            fat: macros.fat
          }
        });
      }
      
      // Fetch complete meal with items
      const completeMeal = await prisma.meal.findUnique({
        where: { id: meal.id },
        include: { items: true }
      });
      
      res.status(201).json(completeMeal);
    } else {
      // Return meal for user to add items via UI
      const meal = await prisma.meal.create({
        data: {
          userId: req.userId,
          dateTime: data.dateTime ? new Date(data.dateTime) : new Date(),
          mealType: data.mealType,
          notes: data.notes || null,
          imagePath,
          method: data.method
        },
        include: { items: true }
      });
      
      res.status(201).json(meal);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Create meal error:', error);
    res.status(500).json({ error: 'Failed to create meal' });
  }
});

// Analyze photo and return detected foods (without saving meal)
router.post('/analyze-photo', authenticate, upload.single('photo'), async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No photo uploaded' });
    }

    const result = await FoodDetectionService.analyzeImage(req.file.path);

    // Clean up temp file after analysis
    fs.unlink(req.file.path, () => {});

    res.json(result);
  } catch (error) {
    console.error('Analyze photo error:', error);
    res.status(500).json({ error: 'Failed to analyze photo' });
  }
});

// Parse text input for foods
router.post('/parse-text', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { textInput } = req.body;
    
    if (!textInput) {
      return res.status(400).json({ error: 'Text input required' });
    }
    
    const result = await FoodDetectionService.parseTextInput(textInput);
    res.json(result);
  } catch (error) {
    console.error('Parse text error:', error);
    res.status(500).json({ error: 'Failed to parse text' });
  }
});

// Add item to meal
router.post('/:mealId/items', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { mealId } = req.params;
    const { foodItemId, name, quantityG } = req.body;
    
    // Verify meal belongs to user
    const meal = await prisma.meal.findFirst({
      where: { id: mealId, userId: req.userId }
    });
    
    if (!meal) {
      return res.status(404).json({ error: 'Meal not found' });
    }
    
    let macros = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    if (foodItemId) {
      const foodItem = await prisma.foodItem.findUnique({
        where: { id: foodItemId }
      });
      
      if (foodItem) {
        macros = NutritionService.calculateMacros(
          quantityG,
          foodItem.caloriesPer100g,
          foodItem.proteinPer100g,
          foodItem.carbsPer100g,
          foodItem.fatPer100g
        );
      }
    }
    
    const mealItem = await prisma.mealItem.create({
      data: {
        mealId,
        foodItemId: foodItemId || null,
        name,
        quantityG,
        calories: macros.calories,
        protein: macros.protein,
        carbs: macros.carbs,
        fat: macros.fat
      }
    });
    
    res.status(201).json(mealItem);
  } catch (error) {
    console.error('Add meal item error:', error);
    res.status(500).json({ error: 'Failed to add meal item' });
  }
});

// Get meals for a date
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { date } = req.query;
    
    let startDate: Date;
    let endDate: Date;
    
    if (date) {
      startDate = new Date(date as string);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(date as string);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    }
    
    const meals = await prisma.meal.findMany({
      where: {
        userId: req.userId,
        dateTime: {
          gte: startDate,
          lte: endDate
        }
      },
      include: { items: true },
      orderBy: { dateTime: 'desc' }
    });
    
    res.json(meals);
  } catch (error) {
    console.error('Get meals error:', error);
    res.status(500).json({ error: 'Failed to get meals' });
  }
});

// Delete meal
router.delete('/:mealId', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { mealId } = req.params;
    
    // Verify meal belongs to user
    const meal = await prisma.meal.findFirst({
      where: { id: mealId, userId: req.userId }
    });
    
    if (!meal) {
      return res.status(404).json({ error: 'Meal not found' });
    }
    
    // Delete image file if exists
    if (meal.imagePath) {
      const filePath = path.join(process.cwd(), meal.imagePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    await prisma.meal.delete({
      where: { id: mealId }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete meal error:', error);
    res.status(500).json({ error: 'Failed to delete meal' });
  }
});

export default router;
