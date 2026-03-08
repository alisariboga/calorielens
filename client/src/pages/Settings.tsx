import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../api/client';
import { OnboardingData } from '../shared-types';
import Layout from '../components/Layout';

export default function Settings() {
  const { profile, refreshProfile } = useAuth();
  const [data, setData] = useState<OnboardingData>({
    sex: 'male',
    age: 30,
    heightCm: 170,
    weightKg: 70,
    activityLevel: 'moderate',
    goalRateKgPerWeek: 0.5
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setData({
        sex: profile.sex,
        age: profile.age,
        heightCm: profile.heightCm,
        weightKg: profile.weightKg,
        activityLevel: profile.activityLevel,
        goalRateKgPerWeek: profile.goalRateKgPerWeek
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await profileApi.update(data);
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Sex at Birth</label>
                <select
                  value={data.sex}
                  onChange={(e) => setData({ ...data, sex: e.target.value as 'male' | 'female' })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Age</label>
                <input
                  type="number"
                  value={data.age}
                  onChange={(e) => setData({ ...data, age: parseInt(e.target.value) })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="13"
                  max="120"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                <input
                  type="number"
                  value={data.heightCm}
                  onChange={(e) => setData({ ...data, heightCm: parseInt(e.target.value) })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="100"
                  max="250"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={data.weightKg}
                  onChange={(e) => setData({ ...data, weightKg: parseFloat(e.target.value) })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="30"
                  max="300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Activity Level</label>
              <select
                value={data.activityLevel}
                onChange={(e) => setData({ ...data, activityLevel: e.target.value as any })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="sedentary">Sedentary - Little or no exercise</option>
                <option value="light">Lightly Active - Light exercise 1-3 days/week</option>
                <option value="moderate">Moderately Active - Moderate exercise 3-5 days/week</option>
                <option value="active">Active - Heavy exercise 6-7 days/week</option>
                <option value="very_active">Very Active - Very heavy exercise, physical job</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Weight Loss Goal</label>
              <select
                value={data.goalRateKgPerWeek}
                onChange={(e) => setData({ ...data, goalRateKgPerWeek: parseFloat(e.target.value) })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value={0.25}>0.25 kg/week - Slow and steady</option>
                <option value={0.5}>0.5 kg/week - Recommended</option>
                <option value={0.75}>0.75 kg/week - Faster results</option>
                <option value={1}>1 kg/week - Aggressive</option>
              </select>
            </div>

            {success && (
              <div className="text-green-600 text-sm bg-green-50 p-3 rounded">
                Profile updated successfully!
              </div>
            )}

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>

          {profile && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Calculated Values</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded">
                  <div className="text-sm text-gray-600">BMR</div>
                  <div className="text-xl font-bold text-gray-900">{Math.round(profile.bmr)} cal</div>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <div className="text-sm text-gray-600">TDEE</div>
                  <div className="text-xl font-bold text-gray-900">{Math.round(profile.tdee)} cal</div>
                </div>
                <div className="bg-gray-50 p-4 rounded">
                  <div className="text-sm text-gray-600">Daily Target</div>
                  <div className="text-xl font-bold text-gray-900">{Math.round(profile.baseTargetCalories)} cal</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-600 bg-blue-50 p-4 rounded-md">
          <strong>Medical Disclaimer:</strong> CalorieLens provides estimates only. Consult a healthcare professional before starting any diet or exercise program.
        </div>
      </div>
    </Layout>
  );
}
