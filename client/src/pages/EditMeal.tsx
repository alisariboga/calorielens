import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mealApi, foodApi } from '../api/client';
import { FoodItem, MealItemInput } from '../shared-types';
import Layout from '../components/Layout';

export default function EditMeal() {
  const { mealId } = useParams<{ mealId: string }>();
  const navigate = useNavigate();
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [items, setItems] = useState<MealItemInput[]>([]);
  const [allFoods, setAllFoods] = useState<FoodItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingMeal, setFetchingMeal] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      mealApi.getById(mealId!),
      foodApi.search('', 300)
    ]).then(([meal, foods]) => {
      setMealType(meal.mealType);
      setItems(meal.items.map(item => ({
        foodItemId: item.foodItemId ?? undefined,
        name: item.name,
        quantityG: item.quantityG,
        caloriesPer100g: item.calories > 0 ? (item.calories / item.quantityG) * 100 : undefined
      })));
      setAllFoods(foods);
    }).catch(() => {
      setError('Failed to load meal');
    }).finally(() => {
      setFetchingMeal(false);
    });
  }, [mealId]);

  const filteredFoods = searchQuery.trim()
    ? allFoods.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : allFoods;

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
    if (items.length === 0) {
      setError('Please add at least one food item');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await mealApi.update(mealId!, { mealType, items });
      navigate('/dashboard');
    } catch {
      setError('Failed to update meal');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingMeal) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Meal</h1>

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

          {/* Current Items */}
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
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Foods */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add More Foods ({allFoods.length} available)
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter foods..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
            />
            <div className="border border-gray-200 rounded-md max-h-48 overflow-y-auto">
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

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</div>
          )}

          <div className="flex justify-end gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || items.length === 0}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
