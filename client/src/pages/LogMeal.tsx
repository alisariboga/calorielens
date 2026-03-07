import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mealApi, foodApi } from '../api/client';
import { FoodItem, MealItemInput } from '@calorielens/shared';
import Layout from '../components/Layout';

export default function LogMeal() {
  const navigate = useNavigate();
  const [method, setMethod] = useState<'photo' | 'text'>('text');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [textInput, setTextInput] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [items, setItems] = useState<MealItemInput[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const results = await foodApi.search(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const addItem = (food: FoodItem) => {
    setItems([...items, {
      foodItemId: food.id,
      name: food.name,
      quantityG: food.defaultServingG
    }]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, quantityG: number) => {
    const newItems = [...items];
    newItems[index].quantityG = quantityG;
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
        formData.append('items', JSON.stringify(items));
        await mealApi.create(formData);
      } else {
        await mealApi.create({
          mealType,
          method: 'text',
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
                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {photo && (
                <div className="mt-2 text-sm text-gray-600">
                  Selected: {photo.name}
                </div>
              )}
            </div>
          )}

          {/* Food Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Add Foods</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for foods..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Search
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-md max-h-60 overflow-y-auto">
                {searchResults.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => addItem(food)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                  >
                    <div className="font-medium">{food.name}</div>
                    <div className="text-sm text-gray-600">
                      {food.caloriesPer100g} cal per 100g
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Added Items */}
          {items.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meal Items</label>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                    </div>
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
