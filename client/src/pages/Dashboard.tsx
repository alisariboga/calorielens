import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { summaryApi, debtApi, mealApi } from '../api/client';
import { DailySummary, WeeklySummary, DebtStatus } from '@calorielens/shared';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Layout from '../components/Layout';

export default function Dashboard() {
  const { profile } = useAuth();
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
  const [debtStatus, setDebtStatus] = useState<DebtStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteMeal = async (mealId: string) => {
    if (!confirm('Delete this meal?')) return;
    try {
      await mealApi.delete(mealId);
      await loadData();
    } catch (error) {
      console.error('Failed to delete meal:', error);
    }
  };

  const loadData = async () => {
    try {
      const [daily, weekly, debt] = await Promise.all([
        summaryApi.getToday(),
        summaryApi.getWeek(),
        debtApi.getStatus()
      ]);
      setDailySummary(daily);
      setWeeklySummary(weekly);
      setDebtStatus(debt);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !dailySummary || !weeklySummary || !profile) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </Layout>
    );
  }

  const caloriesRemaining = dailySummary.remainingCalories;
  const percentConsumed = (dailySummary.consumedCalories / dailySummary.targetCalories) * 100;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your daily progress</p>
        </div>

        {/* Today's Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Target Calories</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {dailySummary.targetCalories}
            </div>
            {dailySummary.debtPayback > 0 && (
              <div className="mt-1 text-xs text-orange-600">
                -{dailySummary.debtPayback} debt payback
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Consumed</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {dailySummary.consumedCalories}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {percentConsumed.toFixed(0)}% of target
            </div>
          </div>

          <div className={`bg-white rounded-lg shadow p-6 ${caloriesRemaining < 0 ? 'border-2 border-red-300' : ''}`}>
            <div className="text-sm font-medium text-gray-600">Remaining</div>
            <div className={`mt-2 text-3xl font-bold ${caloriesRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {caloriesRemaining}
            </div>
            {caloriesRemaining < 0 && (
              <Link to="/debt" className="mt-1 text-xs text-indigo-600 hover:text-indigo-800">
                Create debt →
              </Link>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-600">Protein</div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {dailySummary.protein}g
            </div>
            <div className="mt-1 text-xs text-gray-500">
              C: {dailySummary.carbs}g | F: {dailySummary.fat}g
            </div>
          </div>
        </div>

        {/* Debt Status */}
        {debtStatus && debtStatus.totalRemaining > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-orange-900">Active Calorie Debt</div>
                <div className="text-sm text-orange-700 mt-1">
                  {debtStatus.totalRemaining} calories remaining • Today's payback: {debtStatus.todayPayback} calories
                </div>
              </div>
              <Link
                to="/debt"
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm"
              >
                Manage Debt
              </Link>
            </div>
          </div>
        )}

        {/* Today's Meals */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Today's Meals</h2>
            <Link
              to="/log-meal"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              + Log Meal
            </Link>
          </div>
          <div className="p-6">
            {dailySummary.meals.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No meals logged yet today</p>
            ) : (
              <div className="space-y-4">
                {dailySummary.meals.map((meal) => {
                  const totalCalories = meal.items.reduce((sum, item) => sum + item.calories, 0);
                  return (
                    <div key={meal.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900 capitalize">{meal.mealType}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(meal.dateTime).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <div className="font-bold text-gray-900">{Math.round(totalCalories)} cal</div>
                          <button
                            onClick={() => handleDeleteMeal(meal.id)}
                            className="text-xs text-red-500 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      {meal.items.length > 0 && (
                        <div className="mt-3 text-sm text-gray-600">
                          {meal.items.map((item, idx) => (
                            <div key={idx}>
                              {item.name} ({item.quantityG}g)
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Weekly Progress</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklySummary.days}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="targetCalories" fill="#6366f1" name="Target" />
              <Bar dataKey="consumedCalories" fill="#10b981" name="Consumed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  );
}
