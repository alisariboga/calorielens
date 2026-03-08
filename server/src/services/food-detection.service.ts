import prisma from '../prisma';
import { FoodDetectionResult } from '@calorielens/shared';

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
   * Analyze uploaded image (placeholder for future ML integration)
   * Currently returns empty result, requiring manual entry
   */
  static async analyzeImage(imagePath: string): Promise<FoodDetectionResult> {
    // Future: integrate with local ML model for image recognition
    // For MVP, we return empty and rely on user confirmation
    
    return {
      detectedFoods: [],
      needsConfirmation: true
    };
  }

  /**
   * Search food database
   */
  static async searchFoods(query: string, limit: number = 20) {
    return await prisma.$queryRawUnsafe<Array<{
      id: string;
      name: string;
      caloriesPer100g: number;
      proteinPer100g: number;
      carbsPer100g: number;
      fatPer100g: number;
      defaultServingG: number;
    }>>(
      `SELECT id, name, caloriesPer100g, proteinPer100g, carbsPer100g, fatPer100g, defaultServingG
       FROM FoodItem
       WHERE LOWER(name) LIKE LOWER(?)
       ORDER BY name ASC
       LIMIT ?`,
      `%${query}%`,
      limit
    );
  }
}
