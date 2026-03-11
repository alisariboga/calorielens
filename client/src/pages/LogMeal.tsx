import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { mealApi, foodApi } from '../api/client';
import { FoodItem, MealItemInput } from '../shared-types';
import Layout from '../components/Layout';

export default function LogMeal() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get('date') || undefined;
  const [method, setMethod] = useState<'photo' | 'text'>('text');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [photo, setPhoto] = useState<File | null>(null);
  const [items, setItems] = useState<MealItemInput[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [allFoods, setAllFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    foodApi.search('', 300).then(setAllFoods).catch(() => {});
  }, []);

  const filteredFoods = searchQuery.trim()
    ? allFoods.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : allFoods;

  const handlePhotoChange = async (file: File | null) => {
    setPhoto(file);
    if (!file) return;
    setAnalyzing(true);
    setError('');
    try {
      const result = await mealApi.analyzePhoto(file);
      if (result.detectedFoods.length > 0) {
        const newItems: MealItemInput[] = result.detectedFoods.map(f => ({
          name: f.name,
          quantityG: f.suggestedQuantityG,
          caloriesPer100g: f.caloriesPer100g,
          proteinPer100g: f.proteinPer100g,
          carbsPer100g: f.carbsPer100g,
          fatPer100g: f.fatPer100g
        }));
        setItems(prev => [...prev, ...newItems]);
      } else {
        setError('No food detected in photo. Please add items manually.');
      }
    } catch {
      setError('Photo analysis failed. Please add items manually.');
    } finally {
      setAnalyzing(false);
    }
  };


  const addItem = (food: FoodItem) => {
    setItems([...items, {
      foodItemId: food.id,
      name: food.name,
      quantityG: food.defaultServingG
    }]);
    setSearchQuery('');
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, quantityG: number) => {
    const newItems = [...items];
    newItems[index].quantityG = quantityG;
    setItems(newItems);
  };

  const updateName = (index: number, name: string) => {
    const newItems = [...items];
    newItems[index].name = name;
    setItems(newItems);
  };

  const handleSubmit = async () => {
    if (items.length === 0 && method === 'text') {
      setError('Please add at least one food item');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (method === 'photo' && photo) {
        const formData = new FormData();
        formData.append('photo', photo);
        formData.append('mealType', mealType);
        formData.append('method', 'photo');
        if (dateParam) formData.append('dateTime', dateParam);
        formData.append('items', JSON.stringify(items));
        await mealApi.create(formData);
      } else {
        await mealApi.create({
          mealType,
          method: 'text',
          dateTime: dateParam,
          items
        });
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to log meal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Log Meal</h1>

        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Meal Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
            <div className="grid grid-cols-4 gap-2">
              {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setMealType(type)}
                  className={`px-4 py-2 rounded-md capitalize ${
                    mealType === type
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logging Method</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMethod('text')}
                className={`px-4 py-2 rounded-md ${
                  method === 'text'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Text Entry
              </button>
              <button
                onClick={() => setMethod('photo')}
                className={`px-4 py-2 rounded-md ${
                  method === 'photo'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Photo Upload
              </button>
            </div>
          </div>

          {/* Photo Upload */}
          {method === 'photo' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Photo (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoChange(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {photo && (
                <div className="mt-2 text-sm text-gray-600">
                  Selected: {photo.name}
                </div>
              )}
              {analyzing && (
                <div className="mt-2 text-sm text-indigo-600">
                  Analyzing photo with AI...
                </div>
              )}
            </div>
          )}

          {/* Food Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Foods ({allFoods.length} available)
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter foods..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
            />
            <div className="border border-gray-200 rounded-md max-h-60 overflow-y-auto">
              {filteredFoods.map((food) => (
                <button
                  key={food.id}
                  onClick={() => addItem(food)}
                  className="w-full text-left px-4 py-2 hover:bg-indigo-50 border-b border-gray-100 last:border-0"
                >
                  <div className="font-medium text-sm">{food.name}</div>
                  <div className="text-xs text-gray-500">
                    {food.caloriesPer100g} cal / 100g · serving {food.defaultServingG}g
                  </div>
                </button>
              ))}
              {filteredFoods.length === 0 && (
                <div className="px-4 py-3 text-sm text-gray-500">No foods found</div>
              )}
            </div>
          </div>

          {/* Added Items */}
          {items.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meal Items</label>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateName(index, e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm font-medium"
                    />
                    <input
                      type="number"
                      value={item.quantityG}
                      onChange={(e) => updateQuantity(index, parseFloat(e.target.value))}
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                      min="1"
                    />
                    <span className="text-sm text-gray-600">g</span>
                    <button
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || (method === 'text' && items.length === 0)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Log Meal'}
            </button>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600 bg-yellow-50 p-4 rounded-md">
          <strong>Note:</strong> Calorie estimates are approximate. For photo uploads, please add foods manually for accuracy in this MVP version.
        </div>
      </div>
    </Layout>
  );
}
