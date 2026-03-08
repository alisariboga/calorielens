import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const foods = [
  // Proteins - Meat
  { name: 'Chicken Breast', caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6, defaultServingG: 150 },
  { name: 'Chicken Thigh', caloriesPer100g: 209, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 10.9, defaultServingG: 150 },
  { name: 'Ground Beef (90% lean)', caloriesPer100g: 176, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 10, defaultServingG: 100 },
  { name: 'Ground Beef (80% lean)', caloriesPer100g: 254, proteinPer100g: 17, carbsPer100g: 0, fatPer100g: 20, defaultServingG: 100 },
  { name: 'Steak (Sirloin)', caloriesPer100g: 271, proteinPer100g: 25, carbsPer100g: 0, fatPer100g: 18, defaultServingG: 200 },
  { name: 'Pork Chop', caloriesPer100g: 231, proteinPer100g: 23, carbsPer100g: 0, fatPer100g: 15, defaultServingG: 150 },
  { name: 'Bacon', caloriesPer100g: 541, proteinPer100g: 37, carbsPer100g: 1.4, fatPer100g: 42, defaultServingG: 30 },
  { name: 'Turkey Breast', caloriesPer100g: 135, proteinPer100g: 30, carbsPer100g: 0, fatPer100g: 0.7, defaultServingG: 100 },
  { name: 'Ground Turkey', caloriesPer100g: 149, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 8, defaultServingG: 100 },
  { name: 'Ham', caloriesPer100g: 145, proteinPer100g: 21, carbsPer100g: 1.5, fatPer100g: 5.5, defaultServingG: 75 },
  { name: 'Sausage', caloriesPer100g: 301, proteinPer100g: 12, carbsPer100g: 1.2, fatPer100g: 27, defaultServingG: 50 },
  
  // Proteins - Fish & Seafood
  { name: 'Salmon', caloriesPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 13, defaultServingG: 150 },
  { name: 'Tuna (canned in water)', caloriesPer100g: 116, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 0.8, defaultServingG: 100 },
  { name: 'Tilapia', caloriesPer100g: 129, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 2.7, defaultServingG: 150 },
  { name: 'Cod', caloriesPer100g: 82, proteinPer100g: 18, carbsPer100g: 0, fatPer100g: 0.7, defaultServingG: 150 },
  { name: 'Shrimp', caloriesPer100g: 99, proteinPer100g: 24, carbsPer100g: 0.2, fatPer100g: 0.3, defaultServingG: 100 },
  
  // Proteins - Eggs & Dairy
  { name: 'Egg (whole)', caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11, defaultServingG: 50 },
  { name: 'Egg White', caloriesPer100g: 52, proteinPer100g: 11, carbsPer100g: 0.7, fatPer100g: 0.2, defaultServingG: 33 },
  { name: 'Greek Yogurt (plain, nonfat)', caloriesPer100g: 59, proteinPer100g: 10, carbsPer100g: 3.6, fatPer100g: 0.4, defaultServingG: 170 },
  { name: 'Greek Yogurt (plain, full fat)', caloriesPer100g: 97, proteinPer100g: 9, carbsPer100g: 3.9, fatPer100g: 5, defaultServingG: 170 },
  { name: 'Cottage Cheese (low fat)', caloriesPer100g: 72, proteinPer100g: 12, carbsPer100g: 3.4, fatPer100g: 1, defaultServingG: 110 },
  { name: 'Milk (whole)', caloriesPer100g: 61, proteinPer100g: 3.2, carbsPer100g: 4.8, fatPer100g: 3.3, defaultServingG: 240 },
  { name: 'Milk (skim)', caloriesPer100g: 34, proteinPer100g: 3.4, carbsPer100g: 5, fatPer100g: 0.1, defaultServingG: 240 },
  { name: 'Cheese (Cheddar)', caloriesPer100g: 403, proteinPer100g: 25, carbsPer100g: 1.3, fatPer100g: 33, defaultServingG: 28 },
  { name: 'Cheese (Mozzarella)', caloriesPer100g: 280, proteinPer100g: 28, carbsPer100g: 2.2, fatPer100g: 17, defaultServingG: 28 },
  { name: 'Cheese (Parmesan)', caloriesPer100g: 431, proteinPer100g: 38, carbsPer100g: 4.1, fatPer100g: 29, defaultServingG: 15 },
  
  // Proteins - Plant-based
  { name: 'Tofu (firm)', caloriesPer100g: 144, proteinPer100g: 17, carbsPer100g: 3, fatPer100g: 9, defaultServingG: 100 },
  { name: 'Tempeh', caloriesPer100g: 193, proteinPer100g: 20, carbsPer100g: 9, fatPer100g: 11, defaultServingG: 100 },
  { name: 'Lentils (cooked)', caloriesPer100g: 116, proteinPer100g: 9, carbsPer100g: 20, fatPer100g: 0.4, defaultServingG: 150 },
  { name: 'Black Beans (cooked)', caloriesPer100g: 132, proteinPer100g: 9, carbsPer100g: 24, fatPer100g: 0.5, defaultServingG: 150 },
  { name: 'Chickpeas (cooked)', caloriesPer100g: 164, proteinPer100g: 9, carbsPer100g: 27, fatPer100g: 2.6, defaultServingG: 150 },
  { name: 'Kidney Beans (cooked)', caloriesPer100g: 127, proteinPer100g: 9, carbsPer100g: 23, fatPer100g: 0.5, defaultServingG: 150 },
  { name: 'Edamame', caloriesPer100g: 122, proteinPer100g: 11, carbsPer100g: 9, fatPer100g: 5, defaultServingG: 100 },
  
  // Carbs - Grains & Bread
  { name: 'White Rice (cooked)', caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatPer100g: 0.3, defaultServingG: 150 },
  { name: 'Brown Rice (cooked)', caloriesPer100g: 112, proteinPer100g: 2.6, carbsPer100g: 24, fatPer100g: 0.9, defaultServingG: 150 },
  { name: 'Quinoa (cooked)', caloriesPer100g: 120, proteinPer100g: 4.4, carbsPer100g: 21, fatPer100g: 1.9, defaultServingG: 150 },
  { name: 'Pasta (cooked)', caloriesPer100g: 131, proteinPer100g: 5, carbsPer100g: 25, fatPer100g: 1.1, defaultServingG: 150 },
  { name: 'Whole Wheat Pasta (cooked)', caloriesPer100g: 124, proteinPer100g: 5, carbsPer100g: 26, fatPer100g: 0.5, defaultServingG: 150 },
  { name: 'Oatmeal (cooked)', caloriesPer100g: 71, proteinPer100g: 2.5, carbsPer100g: 12, fatPer100g: 1.5, defaultServingG: 200 },
  { name: 'White Bread', caloriesPer100g: 265, proteinPer100g: 9, carbsPer100g: 49, fatPer100g: 3.2, defaultServingG: 30 },
  { name: 'Whole Wheat Bread', caloriesPer100g: 247, proteinPer100g: 13, carbsPer100g: 41, fatPer100g: 3.4, defaultServingG: 30 },
  { name: 'Bagel', caloriesPer100g: 257, proteinPer100g: 10, carbsPer100g: 50, fatPer100g: 1.4, defaultServingG: 95 },
  { name: 'Tortilla (flour)', caloriesPer100g: 304, proteinPer100g: 8, carbsPer100g: 51, fatPer100g: 7, defaultServingG: 50 },
  { name: 'Pita Bread', caloriesPer100g: 275, proteinPer100g: 9, carbsPer100g: 56, fatPer100g: 1.2, defaultServingG: 60 },
  
  // Carbs - Potatoes & Starchy Vegetables
  { name: 'Sweet Potato (baked)', caloriesPer100g: 90, proteinPer100g: 2, carbsPer100g: 21, fatPer100g: 0.2, defaultServingG: 130 },
  { name: 'Potato (baked)', caloriesPer100g: 93, proteinPer100g: 2.5, carbsPer100g: 21, fatPer100g: 0.1, defaultServingG: 150 },
  { name: 'French Fries', caloriesPer100g: 312, proteinPer100g: 3.4, carbsPer100g: 41, fatPer100g: 15, defaultServingG: 100 },
  { name: 'Corn (cooked)', caloriesPer100g: 96, proteinPer100g: 3.4, carbsPer100g: 21, fatPer100g: 1.5, defaultServingG: 100 },
  { name: 'Peas (cooked)', caloriesPer100g: 84, proteinPer100g: 5.4, carbsPer100g: 16, fatPer100g: 0.2, defaultServingG: 100 },
  
  // Vegetables
  { name: 'Broccoli', caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 7, fatPer100g: 0.4, defaultServingG: 100 },
  { name: 'Spinach', caloriesPer100g: 23, proteinPer100g: 2.9, carbsPer100g: 3.6, fatPer100g: 0.4, defaultServingG: 100 },
  { name: 'Kale', caloriesPer100g: 35, proteinPer100g: 2.9, carbsPer100g: 4.4, fatPer100g: 1.5, defaultServingG: 100 },
  { name: 'Carrots', caloriesPer100g: 41, proteinPer100g: 0.9, carbsPer100g: 10, fatPer100g: 0.2, defaultServingG: 100 },
  { name: 'Bell Pepper', caloriesPer100g: 26, proteinPer100g: 1, carbsPer100g: 6, fatPer100g: 0.3, defaultServingG: 100 },
  { name: 'Tomato', caloriesPer100g: 18, proteinPer100g: 0.9, carbsPer100g: 3.9, fatPer100g: 0.2, defaultServingG: 100 },
  { name: 'Cucumber', caloriesPer100g: 15, proteinPer100g: 0.7, carbsPer100g: 3.6, fatPer100g: 0.1, defaultServingG: 100 },
  { name: 'Lettuce (Romaine)', caloriesPer100g: 17, proteinPer100g: 1.2, carbsPer100g: 3.3, fatPer100g: 0.3, defaultServingG: 100 },
  { name: 'Onion', caloriesPer100g: 40, proteinPer100g: 1.1, carbsPer100g: 9, fatPer100g: 0.1, defaultServingG: 100 },
  { name: 'Mushrooms', caloriesPer100g: 22, proteinPer100g: 3.1, carbsPer100g: 3.3, fatPer100g: 0.3, defaultServingG: 100 },
  { name: 'Zucchini', caloriesPer100g: 17, proteinPer100g: 1.2, carbsPer100g: 3.1, fatPer100g: 0.3, defaultServingG: 100 },
  { name: 'Cauliflower', caloriesPer100g: 25, proteinPer100g: 1.9, carbsPer100g: 5, fatPer100g: 0.3, defaultServingG: 100 },
  { name: 'Green Beans', caloriesPer100g: 31, proteinPer100g: 1.8, carbsPer100g: 7, fatPer100g: 0.2, defaultServingG: 100 },
  { name: 'Asparagus', caloriesPer100g: 20, proteinPer100g: 2.2, carbsPer100g: 3.9, fatPer100g: 0.1, defaultServingG: 100 },
  
  // Fruits
  { name: 'Apple', caloriesPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 14, fatPer100g: 0.2, defaultServingG: 150 },
  { name: 'Banana', caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatPer100g: 0.3, defaultServingG: 120 },
  { name: 'Orange', caloriesPer100g: 47, proteinPer100g: 0.9, carbsPer100g: 12, fatPer100g: 0.1, defaultServingG: 130 },
  { name: 'Strawberries', caloriesPer100g: 32, proteinPer100g: 0.7, carbsPer100g: 7.7, fatPer100g: 0.3, defaultServingG: 150 },
  { name: 'Blueberries', caloriesPer100g: 57, proteinPer100g: 0.7, carbsPer100g: 14, fatPer100g: 0.3, defaultServingG: 150 },
  { name: 'Grapes', caloriesPer100g: 69, proteinPer100g: 0.7, carbsPer100g: 18, fatPer100g: 0.2, defaultServingG: 100 },
  { name: 'Watermelon', caloriesPer100g: 30, proteinPer100g: 0.6, carbsPer100g: 8, fatPer100g: 0.2, defaultServingG: 200 },
  { name: 'Pineapple', caloriesPer100g: 50, proteinPer100g: 0.5, carbsPer100g: 13, fatPer100g: 0.1, defaultServingG: 150 },
  { name: 'Mango', caloriesPer100g: 60, proteinPer100g: 0.8, carbsPer100g: 15, fatPer100g: 0.4, defaultServingG: 150 },
  { name: 'Peach', caloriesPer100g: 39, proteinPer100g: 0.9, carbsPer100g: 10, fatPer100g: 0.3, defaultServingG: 150 },
  { name: 'Avocado', caloriesPer100g: 160, proteinPer100g: 2, carbsPer100g: 9, fatPer100g: 15, defaultServingG: 100 },
  
  // Nuts & Seeds
  { name: 'Almonds', caloriesPer100g: 579, proteinPer100g: 21, carbsPer100g: 22, fatPer100g: 50, defaultServingG: 28 },
  { name: 'Walnuts', caloriesPer100g: 654, proteinPer100g: 15, carbsPer100g: 14, fatPer100g: 65, defaultServingG: 28 },
  { name: 'Cashews', caloriesPer100g: 553, proteinPer100g: 18, carbsPer100g: 30, fatPer100g: 44, defaultServingG: 28 },
  { name: 'Peanuts', caloriesPer100g: 567, proteinPer100g: 26, carbsPer100g: 16, fatPer100g: 49, defaultServingG: 28 },
  { name: 'Peanut Butter', caloriesPer100g: 588, proteinPer100g: 25, carbsPer100g: 20, fatPer100g: 50, defaultServingG: 32 },
  { name: 'Almond Butter', caloriesPer100g: 614, proteinPer100g: 21, carbsPer100g: 19, fatPer100g: 56, defaultServingG: 32 },
  { name: 'Sunflower Seeds', caloriesPer100g: 584, proteinPer100g: 21, carbsPer100g: 20, fatPer100g: 51, defaultServingG: 28 },
  { name: 'Chia Seeds', caloriesPer100g: 486, proteinPer100g: 17, carbsPer100g: 42, fatPer100g: 31, defaultServingG: 15 },
  { name: 'Flax Seeds', caloriesPer100g: 534, proteinPer100g: 18, carbsPer100g: 29, fatPer100g: 42, defaultServingG: 15 },
  
  // Fats & Oils
  { name: 'Olive Oil', caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, defaultServingG: 14 },
  { name: 'Butter', caloriesPer100g: 717, proteinPer100g: 0.9, carbsPer100g: 0.1, fatPer100g: 81, defaultServingG: 14 },
  { name: 'Coconut Oil', caloriesPer100g: 862, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, defaultServingG: 14 },
  { name: 'Mayonnaise', caloriesPer100g: 680, proteinPer100g: 1, carbsPer100g: 0.6, fatPer100g: 75, defaultServingG: 15 },
  
  // Snacks & Treats
  { name: 'Chocolate (dark, 70%)', caloriesPer100g: 598, proteinPer100g: 8, carbsPer100g: 46, fatPer100g: 43, defaultServingG: 40 },
  { name: 'Chocolate (milk)', caloriesPer100g: 535, proteinPer100g: 8, carbsPer100g: 59, fatPer100g: 30, defaultServingG: 40 },
  { name: 'Potato Chips', caloriesPer100g: 536, proteinPer100g: 7, carbsPer100g: 53, fatPer100g: 35, defaultServingG: 28 },
  { name: 'Popcorn (air-popped)', caloriesPer100g: 387, proteinPer100g: 13, carbsPer100g: 78, fatPer100g: 4.5, defaultServingG: 30 },
  { name: 'Granola Bar', caloriesPer100g: 471, proteinPer100g: 8, carbsPer100g: 64, fatPer100g: 20, defaultServingG: 40 },
  { name: 'Ice Cream (vanilla)', caloriesPer100g: 207, proteinPer100g: 3.5, carbsPer100g: 24, fatPer100g: 11, defaultServingG: 100 },
  { name: 'Cookie (chocolate chip)', caloriesPer100g: 488, proteinPer100g: 5, carbsPer100g: 68, fatPer100g: 23, defaultServingG: 30 },
  
  // Beverages & Condiments
  { name: 'Orange Juice', caloriesPer100g: 45, proteinPer100g: 0.7, carbsPer100g: 10, fatPer100g: 0.2, defaultServingG: 240 },
  { name: 'Apple Juice', caloriesPer100g: 46, proteinPer100g: 0.1, carbsPer100g: 11, fatPer100g: 0.1, defaultServingG: 240 },
  { name: 'Soda (cola)', caloriesPer100g: 41, proteinPer100g: 0, carbsPer100g: 11, fatPer100g: 0, defaultServingG: 240 },
  { name: 'Beer', caloriesPer100g: 43, proteinPer100g: 0.5, carbsPer100g: 3.6, fatPer100g: 0, defaultServingG: 355 },
  { name: 'Wine (red)', caloriesPer100g: 85, proteinPer100g: 0.1, carbsPer100g: 2.6, fatPer100g: 0, defaultServingG: 150 },
  { name: 'Ketchup', caloriesPer100g: 101, proteinPer100g: 1, carbsPer100g: 27, fatPer100g: 0.1, defaultServingG: 17 },
  { name: 'Mustard', caloriesPer100g: 66, proteinPer100g: 4, carbsPer100g: 6, fatPer100g: 3.3, defaultServingG: 15 },
  { name: 'Soy Sauce', caloriesPer100g: 53, proteinPer100g: 8, carbsPer100g: 5, fatPer100g: 0.1, defaultServingG: 15 },
  { name: 'Honey', caloriesPer100g: 304, proteinPer100g: 0.3, carbsPer100g: 82, fatPer100g: 0, defaultServingG: 21 },
  { name: 'Maple Syrup', caloriesPer100g: 260, proteinPer100g: 0, carbsPer100g: 67, fatPer100g: 0.2, defaultServingG: 20 },
  
  // Breakfast Items
  { name: 'Pancake', caloriesPer100g: 227, proteinPer100g: 6, carbsPer100g: 28, fatPer100g: 10, defaultServingG: 70 },
  { name: 'Waffle', caloriesPer100g: 291, proteinPer100g: 7, carbsPer100g: 37, fatPer100g: 13, defaultServingG: 75 },
  { name: 'Cereal (corn flakes)', caloriesPer100g: 357, proteinPer100g: 7, carbsPer100g: 84, fatPer100g: 0.9, defaultServingG: 30 },
  { name: 'Granola', caloriesPer100g: 471, proteinPer100g: 14, carbsPer100g: 53, fatPer100g: 22, defaultServingG: 50 },
  
  // Fast Food & Restaurant Items
  { name: 'Pizza (cheese)', caloriesPer100g: 266, proteinPer100g: 11, carbsPer100g: 33, fatPer100g: 10, defaultServingG: 100 },
  { name: 'Pizza (pepperoni)', caloriesPer100g: 298, proteinPer100g: 13, carbsPer100g: 36, fatPer100g: 11, defaultServingG: 100 },
  { name: 'Hamburger', caloriesPer100g: 295, proteinPer100g: 17, carbsPer100g: 24, fatPer100g: 14, defaultServingG: 150 },
  { name: 'Cheeseburger', caloriesPer100g: 303, proteinPer100g: 16, carbsPer100g: 24, fatPer100g: 15, defaultServingG: 150 },
  { name: 'Hot Dog', caloriesPer100g: 290, proteinPer100g: 10, carbsPer100g: 2, fatPer100g: 26, defaultServingG: 100 },
  { name: 'Burrito', caloriesPer100g: 206, proteinPer100g: 8, carbsPer100g: 25, fatPer100g: 8, defaultServingG: 200 },
  { name: 'Taco', caloriesPer100g: 226, proteinPer100g: 10, carbsPer100g: 18, fatPer100g: 13, defaultServingG: 100 },
  { name: 'Fried Chicken', caloriesPer100g: 246, proteinPer100g: 19, carbsPer100g: 9, fatPer100g: 15, defaultServingG: 120 },
  { name: 'Chicken Nuggets', caloriesPer100g: 296, proteinPer100g: 15, carbsPer100g: 18, fatPer100g: 18, defaultServingG: 100 },
  
  // Asian Dishes
  { name: 'Sushi Roll (California)', caloriesPer100g: 93, proteinPer100g: 2.9, carbsPer100g: 18, fatPer100g: 0.9, defaultServingG: 150 },
  { name: 'Fried Rice', caloriesPer100g: 163, proteinPer100g: 4, carbsPer100g: 20, fatPer100g: 7, defaultServingG: 200 },
  { name: 'Pad Thai', caloriesPer100g: 158, proteinPer100g: 5, carbsPer100g: 22, fatPer100g: 6, defaultServingG: 250 },
  { name: 'Ramen Noodles', caloriesPer100g: 436, proteinPer100g: 10, carbsPer100g: 62, fatPer100g: 17, defaultServingG: 80 },
  
  // Sandwiches & Wraps
  { name: 'Turkey Sandwich', caloriesPer100g: 200, proteinPer100g: 11, carbsPer100g: 25, fatPer100g: 5, defaultServingG: 150 },
  { name: 'BLT Sandwich', caloriesPer100g: 239, proteinPer100g: 10, carbsPer100g: 20, fatPer100g: 13, defaultServingG: 150 },
  { name: 'Grilled Cheese', caloriesPer100g: 377, proteinPer100g: 14, carbsPer100g: 32, fatPer100g: 21, defaultServingG: 100 },
  
  // Salad Dressings
  { name: 'Ranch Dressing', caloriesPer100g: 458, proteinPer100g: 1, carbsPer100g: 7, fatPer100g: 48, defaultServingG: 30 },
  { name: 'Caesar Dressing', caloriesPer100g: 468, proteinPer100g: 2, carbsPer100g: 4, fatPer100g: 50, defaultServingG: 30 },
  { name: 'Italian Dressing', caloriesPer100g: 267, proteinPer100g: 0.3, carbsPer100g: 13, fatPer100g: 24, defaultServingG: 30 },
  { name: 'Balsamic Vinaigrette', caloriesPer100g: 267, proteinPer100g: 0, carbsPer100g: 13, fatPer100g: 24, defaultServingG: 30 },
  
  // Soups
  { name: 'Chicken Noodle Soup', caloriesPer100g: 38, proteinPer100g: 2, carbsPer100g: 5, fatPer100g: 1, defaultServingG: 240 },
  { name: 'Tomato Soup', caloriesPer100g: 33, proteinPer100g: 1, carbsPer100g: 7, fatPer100g: 0.5, defaultServingG: 240 },
  { name: 'Minestrone Soup', caloriesPer100g: 35, proteinPer100g: 1.5, carbsPer100g: 6, fatPer100g: 1, defaultServingG: 240 },
  
  // Protein Supplements
  { name: 'Whey Protein Powder', caloriesPer100g: 400, proteinPer100g: 80, carbsPer100g: 7, fatPer100g: 5, defaultServingG: 30 },
  { name: 'Protein Bar', caloriesPer100g: 400, proteinPer100g: 40, carbsPer100g: 40, fatPer100g: 12, defaultServingG: 60 },
  
  // Specialty Items
  { name: 'Hummus', caloriesPer100g: 166, proteinPer100g: 8, carbsPer100g: 14, fatPer100g: 10, defaultServingG: 30 },
  { name: 'Guacamole', caloriesPer100g: 160, proteinPer100g: 2, carbsPer100g: 9, fatPer100g: 15, defaultServingG: 30 },
  { name: 'Salsa', caloriesPer100g: 36, proteinPer100g: 1.5, carbsPer100g: 8, fatPer100g: 0.2, defaultServingG: 30 },

  // More Proteins - Meat
  { name: 'Lamb Chop', caloriesPer100g: 294, proteinPer100g: 25, carbsPer100g: 0, fatPer100g: 21, defaultServingG: 150 },
  { name: 'Beef Stew', caloriesPer100g: 120, proteinPer100g: 12, carbsPer100g: 8, fatPer100g: 4, defaultServingG: 250 },
  { name: 'Beef Jerky', caloriesPer100g: 336, proteinPer100g: 33, carbsPer100g: 22, fatPer100g: 12, defaultServingG: 30 },
  { name: 'Pepperoni', caloriesPer100g: 494, proteinPer100g: 20, carbsPer100g: 2, fatPer100g: 44, defaultServingG: 30 },
  { name: 'Salami', caloriesPer100g: 378, proteinPer100g: 22, carbsPer100g: 1, fatPer100g: 31, defaultServingG: 30 },
  { name: 'Deli Turkey', caloriesPer100g: 104, proteinPer100g: 17, carbsPer100g: 2, fatPer100g: 3, defaultServingG: 60 },

  // More Seafood
  { name: 'Sardines (canned)', caloriesPer100g: 208, proteinPer100g: 25, carbsPer100g: 0, fatPer100g: 11, defaultServingG: 90 },
  { name: 'Crab (cooked)', caloriesPer100g: 97, proteinPer100g: 19, carbsPer100g: 0, fatPer100g: 2, defaultServingG: 100 },
  { name: 'Lobster (cooked)', caloriesPer100g: 98, proteinPer100g: 20, carbsPer100g: 1.3, fatPer100g: 0.6, defaultServingG: 150 },
  { name: 'Scallops', caloriesPer100g: 111, proteinPer100g: 20, carbsPer100g: 5, fatPer100g: 0.8, defaultServingG: 100 },
  { name: 'Halibut', caloriesPer100g: 111, proteinPer100g: 23, carbsPer100g: 0, fatPer100g: 2.3, defaultServingG: 150 },
  { name: 'Tuna Steak', caloriesPer100g: 184, proteinPer100g: 30, carbsPer100g: 0, fatPer100g: 6, defaultServingG: 150 },

  // More Dairy
  { name: 'Cream Cheese', caloriesPer100g: 342, proteinPer100g: 6, carbsPer100g: 4, fatPer100g: 34, defaultServingG: 30 },
  { name: 'Sour Cream', caloriesPer100g: 193, proteinPer100g: 2.4, carbsPer100g: 4.6, fatPer100g: 19, defaultServingG: 30 },
  { name: 'Heavy Cream', caloriesPer100g: 345, proteinPer100g: 2.1, carbsPer100g: 2.8, fatPer100g: 37, defaultServingG: 30 },
  { name: 'Feta Cheese', caloriesPer100g: 264, proteinPer100g: 14, carbsPer100g: 4, fatPer100g: 21, defaultServingG: 30 },
  { name: 'Ricotta Cheese', caloriesPer100g: 174, proteinPer100g: 11, carbsPer100g: 3, fatPer100g: 13, defaultServingG: 60 },
  { name: 'Brie', caloriesPer100g: 334, proteinPer100g: 21, carbsPer100g: 0.5, fatPer100g: 28, defaultServingG: 30 },
  { name: 'Kefir', caloriesPer100g: 52, proteinPer100g: 3.5, carbsPer100g: 4.8, fatPer100g: 1, defaultServingG: 240 },

  // More Vegetables
  { name: 'Celery', caloriesPer100g: 16, proteinPer100g: 0.7, carbsPer100g: 3, fatPer100g: 0.2, defaultServingG: 100 },
  { name: 'Beets', caloriesPer100g: 43, proteinPer100g: 1.6, carbsPer100g: 10, fatPer100g: 0.2, defaultServingG: 100 },
  { name: 'Artichoke', caloriesPer100g: 47, proteinPer100g: 3.3, carbsPer100g: 11, fatPer100g: 0.2, defaultServingG: 120 },
  { name: 'Brussels Sprouts', caloriesPer100g: 43, proteinPer100g: 3.4, carbsPer100g: 9, fatPer100g: 0.3, defaultServingG: 100 },
  { name: 'Eggplant', caloriesPer100g: 25, proteinPer100g: 1, carbsPer100g: 6, fatPer100g: 0.2, defaultServingG: 100 },
  { name: 'Leek', caloriesPer100g: 61, proteinPer100g: 1.5, carbsPer100g: 14, fatPer100g: 0.3, defaultServingG: 100 },
  { name: 'Radish', caloriesPer100g: 16, proteinPer100g: 0.7, carbsPer100g: 3.4, fatPer100g: 0.1, defaultServingG: 100 },
  { name: 'Bok Choy', caloriesPer100g: 13, proteinPer100g: 1.5, carbsPer100g: 2.2, fatPer100g: 0.2, defaultServingG: 100 },
  { name: 'Arugula', caloriesPer100g: 25, proteinPer100g: 2.6, carbsPer100g: 3.7, fatPer100g: 0.7, defaultServingG: 50 },

  // More Fruits
  { name: 'Kiwi', caloriesPer100g: 61, proteinPer100g: 1.1, carbsPer100g: 15, fatPer100g: 0.5, defaultServingG: 75 },
  { name: 'Cherries', caloriesPer100g: 63, proteinPer100g: 1.1, carbsPer100g: 16, fatPer100g: 0.2, defaultServingG: 100 },
  { name: 'Raspberries', caloriesPer100g: 52, proteinPer100g: 1.2, carbsPer100g: 12, fatPer100g: 0.7, defaultServingG: 100 },
  { name: 'Pomegranate', caloriesPer100g: 83, proteinPer100g: 1.7, carbsPer100g: 19, fatPer100g: 1.2, defaultServingG: 100 },
  { name: 'Pear', caloriesPer100g: 57, proteinPer100g: 0.4, carbsPer100g: 15, fatPer100g: 0.1, defaultServingG: 170 },
  { name: 'Plum', caloriesPer100g: 46, proteinPer100g: 0.7, carbsPer100g: 11, fatPer100g: 0.3, defaultServingG: 80 },
  { name: 'Grapefruit', caloriesPer100g: 42, proteinPer100g: 0.8, carbsPer100g: 11, fatPer100g: 0.1, defaultServingG: 150 },
  { name: 'Lychee', caloriesPer100g: 66, proteinPer100g: 0.8, carbsPer100g: 17, fatPer100g: 0.4, defaultServingG: 100 },
  { name: 'Coconut (fresh)', caloriesPer100g: 354, proteinPer100g: 3.3, carbsPer100g: 15, fatPer100g: 33, defaultServingG: 40 },

  // Indian Dishes
  { name: 'Chicken Tikka Masala', caloriesPer100g: 150, proteinPer100g: 14, carbsPer100g: 8, fatPer100g: 7, defaultServingG: 250 },
  { name: 'Dal (lentil curry)', caloriesPer100g: 90, proteinPer100g: 5, carbsPer100g: 14, fatPer100g: 2, defaultServingG: 200 },
  { name: 'Naan', caloriesPer100g: 317, proteinPer100g: 9, carbsPer100g: 55, fatPer100g: 7, defaultServingG: 90 },
  { name: 'Basmati Rice (cooked)', caloriesPer100g: 121, proteinPer100g: 2.5, carbsPer100g: 27, fatPer100g: 0.2, defaultServingG: 150 },
  { name: 'Paneer', caloriesPer100g: 265, proteinPer100g: 18, carbsPer100g: 3, fatPer100g: 20, defaultServingG: 100 },
  { name: 'Samosa', caloriesPer100g: 262, proteinPer100g: 5, carbsPer100g: 30, fatPer100g: 14, defaultServingG: 60 },
  { name: 'Biryani (chicken)', caloriesPer100g: 160, proteinPer100g: 10, carbsPer100g: 20, fatPer100g: 5, defaultServingG: 300 },
  { name: 'Palak Paneer', caloriesPer100g: 145, proteinPer100g: 7, carbsPer100g: 6, fatPer100g: 11, defaultServingG: 200 },

  // Mediterranean
  { name: 'Falafel', caloriesPer100g: 333, proteinPer100g: 13, carbsPer100g: 32, fatPer100g: 18, defaultServingG: 100 },
  { name: 'Tzatziki', caloriesPer100g: 65, proteinPer100g: 4, carbsPer100g: 4, fatPer100g: 4, defaultServingG: 60 },
  { name: 'Tabbouleh', caloriesPer100g: 70, proteinPer100g: 2, carbsPer100g: 12, fatPer100g: 2, defaultServingG: 100 },
  { name: 'Shawarma (chicken)', caloriesPer100g: 195, proteinPer100g: 16, carbsPer100g: 12, fatPer100g: 9, defaultServingG: 200 },
  { name: 'Greek Salad', caloriesPer100g: 70, proteinPer100g: 2, carbsPer100g: 4, fatPer100g: 5, defaultServingG: 200 },
  { name: 'Dolma (stuffed grape leaf)', caloriesPer100g: 140, proteinPer100g: 3, carbsPer100g: 16, fatPer100g: 7, defaultServingG: 60 },

  // Italian
  { name: 'Lasagna', caloriesPer100g: 135, proteinPer100g: 8, carbsPer100g: 13, fatPer100g: 6, defaultServingG: 250 },
  { name: 'Risotto', caloriesPer100g: 133, proteinPer100g: 3.5, carbsPer100g: 23, fatPer100g: 3, defaultServingG: 250 },
  { name: 'Gnocchi', caloriesPer100g: 130, proteinPer100g: 3.2, carbsPer100g: 28, fatPer100g: 0.5, defaultServingG: 200 },
  { name: 'Bruschetta', caloriesPer100g: 196, proteinPer100g: 5, carbsPer100g: 28, fatPer100g: 7, defaultServingG: 80 },
  { name: 'Pesto Sauce', caloriesPer100g: 490, proteinPer100g: 11, carbsPer100g: 7, fatPer100g: 48, defaultServingG: 30 },
  { name: 'Marinara Sauce', caloriesPer100g: 54, proteinPer100g: 1.5, carbsPer100g: 9, fatPer100g: 1.7, defaultServingG: 80 },

  // Mexican
  { name: 'Refried Beans', caloriesPer100g: 100, proteinPer100g: 6, carbsPer100g: 16, fatPer100g: 1.5, defaultServingG: 100 },
  { name: 'Corn Tortilla', caloriesPer100g: 218, proteinPer100g: 6, carbsPer100g: 46, fatPer100g: 2.5, defaultServingG: 30 },
  { name: 'Nachos', caloriesPer100g: 346, proteinPer100g: 8, carbsPer100g: 37, fatPer100g: 19, defaultServingG: 100 },
  { name: 'Quesadilla (cheese)', caloriesPer100g: 290, proteinPer100g: 13, carbsPer100g: 25, fatPer100g: 15, defaultServingG: 120 },
  { name: 'Enchilada (chicken)', caloriesPer100g: 168, proteinPer100g: 10, carbsPer100g: 16, fatPer100g: 7, defaultServingG: 200 },

  // Breakfast & Bakery
  { name: 'Croissant', caloriesPer100g: 406, proteinPer100g: 9, carbsPer100g: 46, fatPer100g: 21, defaultServingG: 57 },
  { name: 'Muffin (blueberry)', caloriesPer100g: 377, proteinPer100g: 5, carbsPer100g: 55, fatPer100g: 16, defaultServingG: 90 },
  { name: 'Donut (glazed)', caloriesPer100g: 452, proteinPer100g: 5, carbsPer100g: 51, fatPer100g: 25, defaultServingG: 50 },
  { name: 'English Muffin', caloriesPer100g: 227, proteinPer100g: 8, carbsPer100g: 44, fatPer100g: 2, defaultServingG: 57 },
  { name: 'French Toast', caloriesPer100g: 229, proteinPer100g: 7.5, carbsPer100g: 31, fatPer100g: 9, defaultServingG: 90 },
  { name: 'Eggs Benedict', caloriesPer100g: 198, proteinPer100g: 9, carbsPer100g: 16, fatPer100g: 11, defaultServingG: 200 },
  { name: 'Scrambled Eggs', caloriesPer100g: 149, proteinPer100g: 10, carbsPer100g: 1.6, fatPer100g: 11, defaultServingG: 100 },

  // Coffee & Drinks
  { name: 'Black Coffee', caloriesPer100g: 1, proteinPer100g: 0.1, carbsPer100g: 0, fatPer100g: 0, defaultServingG: 240 },
  { name: 'Latte (whole milk)', caloriesPer100g: 54, proteinPer100g: 3.2, carbsPer100g: 5.4, fatPer100g: 2, defaultServingG: 360 },
  { name: 'Cappuccino', caloriesPer100g: 37, proteinPer100g: 2.5, carbsPer100g: 3.5, fatPer100g: 1.2, defaultServingG: 180 },
  { name: 'Frappuccino', caloriesPer100g: 82, proteinPer100g: 1.5, carbsPer100g: 16, fatPer100g: 1.5, defaultServingG: 400 },
  { name: 'Green Tea', caloriesPer100g: 1, proteinPer100g: 0.2, carbsPer100g: 0.2, fatPer100g: 0, defaultServingG: 240 },
  { name: 'Protein Shake (milk-based)', caloriesPer100g: 75, proteinPer100g: 8, carbsPer100g: 6, fatPer100g: 2, defaultServingG: 350 },
  { name: 'Smoothie (fruit)', caloriesPer100g: 60, proteinPer100g: 1, carbsPer100g: 14, fatPer100g: 0.3, defaultServingG: 350 },
  { name: 'Sports Drink (Gatorade)', caloriesPer100g: 26, proteinPer100g: 0, carbsPer100g: 7, fatPer100g: 0, defaultServingG: 500 },
  { name: 'Coconut Water', caloriesPer100g: 19, proteinPer100g: 0.7, carbsPer100g: 4.5, fatPer100g: 0.2, defaultServingG: 330 },

  // More Snacks
  { name: 'Rice Cakes', caloriesPer100g: 387, proteinPer100g: 8, carbsPer100g: 81, fatPer100g: 3, defaultServingG: 18 },
  { name: 'Pretzels', caloriesPer100g: 380, proteinPer100g: 9, carbsPer100g: 80, fatPer100g: 2, defaultServingG: 30 },
  { name: 'Crackers (whole grain)', caloriesPer100g: 421, proteinPer100g: 10, carbsPer100g: 68, fatPer100g: 13, defaultServingG: 28 },
  { name: 'Trail Mix', caloriesPer100g: 462, proteinPer100g: 12, carbsPer100g: 45, fatPer100g: 28, defaultServingG: 40 },
  { name: 'Dark Chocolate (85%)', caloriesPer100g: 604, proteinPer100g: 10, carbsPer100g: 29, fatPer100g: 51, defaultServingG: 30 },
  { name: 'Gummy Bears', caloriesPer100g: 330, proteinPer100g: 6, carbsPer100g: 77, fatPer100g: 0.5, defaultServingG: 40 },

  // Condiments & Sauces
  { name: 'Barbecue Sauce', caloriesPer100g: 172, proteinPer100g: 1, carbsPer100g: 40, fatPer100g: 0.8, defaultServingG: 30 },
  { name: 'Hot Sauce', caloriesPer100g: 11, proteinPer100g: 0.6, carbsPer100g: 1.8, fatPer100g: 0.4, defaultServingG: 10 },
  { name: 'Sriracha', caloriesPer100g: 93, proteinPer100g: 1.5, carbsPer100g: 18, fatPer100g: 2.5, defaultServingG: 10 },
  { name: 'Tahini', caloriesPer100g: 595, proteinPer100g: 17, carbsPer100g: 21, fatPer100g: 54, defaultServingG: 15 },
  { name: 'Teriyaki Sauce', caloriesPer100g: 89, proteinPer100g: 5, carbsPer100g: 17, fatPer100g: 0.1, defaultServingG: 30 },
  { name: 'Cream of Mushroom Soup', caloriesPer100g: 53, proteinPer100g: 1.5, carbsPer100g: 7, fatPer100g: 2, defaultServingG: 240 },
];

async function main() {
  console.log('Starting seed...');
  
  // Clear existing food items
  await prisma.foodItem.deleteMany({});
  
  // Insert food items
  for (const food of foods) {
    await prisma.foodItem.create({
      data: food
    });
  }
  
  console.log(`Seeded ${foods.length} food items`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
