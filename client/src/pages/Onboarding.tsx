import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { OnboardingData } from '@calorielens/shared';

export default function Onboarding() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  
  const [data, setData] = useState<OnboardingData>({
    sex: 'male',
    age: 30,
    heightCm: 170,
    weightKg: 70,
    activityLevel: 'moderate',
    goalRateKgPerWeek: 0.5
  });

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setWarning('');

    try {
      const result = await profileApi.create(data);
      if ((result as any).warning) {
        setWarning((result as any).warning);
      }
      await refreshProfile();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Sex at Birth</label>
              <div className="mt-2 space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="male"
                    checked={data.sex === 'male'}
                    onChange={(e) => setData({ ...data, sex: e.target.value as 'male' })}
                    className="form-radio"
                  />
                  <span className="ml-2">Male</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="female"
                    checked={data.sex === 'female'}
                    onChange={(e) => setData({ ...data, sex: e.target.value as 'female' })}
                    className="form-radio"
                  />
                  <span className="ml-2">Female</span>
                </label>
              </div>
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
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Activity Level</h2>
            
            <div className="space-y-3">
              {[
                { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
                { value: 'light', label: 'Lightly Active', desc: 'Light exercise 1-3 days/week' },
                { value: 'moderate', label: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week' },
                { value: 'active', label: 'Active', desc: 'Heavy exercise 6-7 days/week' },
                { value: 'very_active', label: 'Very Active', desc: 'Very heavy exercise, physical job' }
              ].map((option) => (
                <label
                  key={option.value}
                  className={`block p-4 border rounded-lg cursor-pointer ${
                    data.activityLevel === option.value
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    value={option.value}
                    checked={data.activityLevel === option.value}
                    onChange={(e) => setData({ ...data, activityLevel: e.target.value as any })}
                    className="sr-only"
                  />
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.desc}</div>
                </label>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Weight Loss Goal</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                How fast do you want to lose weight?
              </label>
              <div className="mt-3 space-y-3">
                {[
                  { value: 0.25, label: '0.25 kg/week', desc: 'Slow and steady' },
                  { value: 0.5, label: '0.5 kg/week', desc: 'Recommended for most people' },
                  { value: 0.75, label: '0.75 kg/week', desc: 'Faster results' },
                  { value: 1, label: '1 kg/week', desc: 'Aggressive (may be challenging)' }
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`block p-4 border rounded-lg cursor-pointer ${
                      data.goalRateKgPerWeek === option.value
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      value={option.value}
                      checked={data.goalRateKgPerWeek === option.value}
                      onChange={(e) => setData({ ...data, goalRateKgPerWeek: parseFloat(e.target.value) })}
                      className="sr-only"
                    />
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-gray-600">{option.desc}</div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Step {step} of 3</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          {renderStep()}

          {error && (
            <div className="mt-6 text-red-600 text-sm bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          {warning && (
            <div className="mt-6 text-yellow-800 text-sm bg-yellow-50 p-3 rounded">
              {warning}
            </div>
          )}

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Complete Setup'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
