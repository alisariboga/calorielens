import fs from 'fs';
import Anthropic from '@anthropic-ai/sdk';
import prisma from '../prisma';
import { FoodDetectionResult } from '../shared-types';

export class FoodDetectionService {
  /**
   * Parse text input to detect food items
   * Uses simple keyword matching and returns suggestions for user confirmation
   */
  static async parseTextInput(textInput: string): Promise<FoodDetectionResult> {
    const normalizedText = textInput.toLowerCase();
    
    // Get all food items from database
    const allFoods = await prisma.foodItem.findMany();
    
    const detectedFoods: Array<{
      name: string;
      confidence: number;
      suggestedQuantityG: number;
    }> = [];
    
    // Simple keyword matching
    for (const food of allFoods) {
      const foodName = food.name.toLowerCase();
      
      if (normalizedText.includes(foodName)) {
        // Try to extract quantity from text
        const quantity = this.extractQuantity(textInput, foodName);
        
        detectedFoods.push({
          name: food.name,
          confidence: 0.8, // Medium confidence for text matching
          suggestedQuantityG: quantity || food.defaultServingG
        });
      }
    }
    
    // If no exact matches, try partial matches
    if (detectedFoods.length === 0) {
      const words = normalizedText.split(/\s+/);
      
      for (const food of allFoods) {
        const foodWords = food.name.toLowerCase().split(/\s+/);
        
        for (const foodWord of foodWords) {
          if (words.some(w => w.includes(foodWord) || foodWord.includes(w))) {
            detectedFoods.push({
              name: food.name,
              confidence: 0.5, // Lower confidence for partial match
              suggestedQuantityG: food.defaultServingG
            });
            break;
          }
        }
      }
    }
    
    return {
      detectedFoods: detectedFoods.slice(0, 10), // Limit to 10 suggestions
      needsConfirmation: true
    };
  }

  /**
   * Simple quantity extraction from text
   */
  private static extractQuantity(text: string, foodName: string): number | null {
    // Look for patterns like "2 eggs", "100g chicken", "1 slice of bread"
    const patterns = [
      /(\d+)\s*g/i,           // "100g"
      /(\d+)\s*kg/i,          // "1kg" -> convert to g
      /(\d+)\s*oz/i,          // "4oz" -> convert to g
      /(\d+)\s+(?:pieces?|slices?|cups?)/i  // "2 pieces"
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const value = parseInt(match[1]);
        
        // Convert units
        if (text.includes('kg')) return value * 1000;
        if (text.includes('oz')) return value * 28.35;
        
        return value;
      }
    }
    
    // Look for numeric quantity before the food name
    const beforeFood = text.toLowerCase().split(foodName)[0];
    const numMatch = beforeFood.match(/(\d+)/);
    
    if (numMatch) {
      // Assume it's a count, use default serving size
      const count = parseInt(numMatch[1]);
      return count * 100; // Assume 100g per item as fallback
    }
    
    return null;
  }

  /**
   * Analyze uploaded image using Claude vision API
   */
  static async analyzeImage(imagePath: string): Promise<FoodDetectionResult> {
    if (!process.env.ANTHROPIC_API_KEY) {
      return { detectedFoods: [], needsConfirmation: true };
    }

    try {
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');

      // Determine media type from file extension
      const ext = imagePath.split('.').pop()?.toLowerCase();
      type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
      const mediaTypeMap: Record<string, ImageMediaType> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp'
      };
      const mediaType: ImageMediaType = (ext && mediaTypeMap[ext]) || 'image/jpeg';

      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      const response = await client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: mediaType, data: base64Image }
              },
              {
                type: 'text',
                text: `Analyze this food image and identify all food items visible. For each item, estimate the quantity in grams and provide nutritional values per 100g.

Respond ONLY with a JSON array in this exact format (no markdown, no explanation):
[
  {"name": "food name", "quantityG": 150, "confidence": 0.9, "caloriesPer100g": 165, "proteinPer100g": 31, "carbsPer100g": 0, "fatPer100g": 3.6},
  {"name": "another food", "quantityG": 80, "confidence": 0.7, "caloriesPer100g": 130, "proteinPer100g": 3, "carbsPer100g": 28, "fatPer100g": 0.3}
]

If no food is visible, respond with an empty array: []
Use common food names. Provide accurate nutritional estimates per 100g based on typical values.`
              }
            ]
          }
        ]
      });

      const textBlock = response.content.find(b => b.type === 'text');
      if (!textBlock || textBlock.type !== 'text') {
        return { detectedFoods: [], needsConfirmation: true };
      }

      const parsed: Array<{
        name: string;
        quantityG: number;
        confidence: number;
        caloriesPer100g?: number;
        proteinPer100g?: number;
        carbsPer100g?: number;
        fatPer100g?: number;
      }> = JSON.parse(textBlock.text.trim());

      const detectedFoods = parsed.map(item => ({
        name: item.name,
        confidence: item.confidence,
        suggestedQuantityG: item.quantityG,
        caloriesPer100g: item.caloriesPer100g,
        proteinPer100g: item.proteinPer100g,
        carbsPer100g: item.carbsPer100g,
        fatPer100g: item.fatPer100g
      }));

      return { detectedFoods, needsConfirmation: detectedFoods.length > 0 };
    } catch {
      return { detectedFoods: [], needsConfirmation: true };
    }
  }

  /**
   * Analyze image from base64 string (for mobile clients)
   */
  static async analyzeImageBase64(base64: string, mimeType: string): Promise<FoodDetectionResult> {
    console.log('analyzeImageBase64 called, base64 length:', base64?.length, 'mimeType:', mimeType);
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('ERROR: ANTHROPIC_API_KEY is not set');
      return { detectedFoods: [], needsConfirmation: true };
    }
    try {
      type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
      const validTypes: ImageMediaType[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const mediaType: ImageMediaType = validTypes.includes(mimeType as ImageMediaType)
        ? (mimeType as ImageMediaType)
        : 'image/jpeg';

      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const response = await client.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
            {
              type: 'text',
              text: `Analyze this food image and identify all food items visible. For each item, estimate the quantity in grams and provide nutritional values per 100g.\n\nRespond ONLY with a JSON array in this exact format (no markdown, no explanation):\n[\n  {"name": "food name", "quantityG": 150, "confidence": 0.9, "caloriesPer100g": 165, "proteinPer100g": 31, "carbsPer100g": 0, "fatPer100g": 3.6}\n]\n\nIf no food is visible, respond with an empty array: []\nUse common food names. Provide accurate nutritional estimates per 100g based on typical values.`
            }
          ]
        }]
      });

      const textBlock = response.content.find(b => b.type === 'text');
      if (!textBlock || textBlock.type !== 'text') return { detectedFoods: [], needsConfirmation: true };

      console.log('Claude response:', textBlock.text.substring(0, 300));

      let jsonText = textBlock.text.trim();
      // Strip markdown code blocks if present
      if (jsonText.includes('```')) {
        jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
      }
      const parsed = JSON.parse(jsonText);
      const detectedFoods = parsed.map((item: any) => ({
        name: item.name, confidence: item.confidence,
        suggestedQuantityG: item.quantityG,
        caloriesPer100g: item.caloriesPer100g, proteinPer100g: item.proteinPer100g,
        carbsPer100g: item.carbsPer100g, fatPer100g: item.fatPer100g
      }));
      return { detectedFoods, needsConfirmation: detectedFoods.length > 0 };
    } catch (err: any) {
      console.log('analyzeImageBase64 error:', err?.message, err?.status, err?.error);
      return { detectedFoods: [], needsConfirmation: true };
    }
  }

  /**
   * Search food database
   */
  static async searchFoods(query: string, limit: number = 20) {
    return await prisma.foodItem.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive'
        }
      },
      take: limit,
      orderBy: {
        name: 'asc'
      }
    });
  }
}
