import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { debtApi, summaryApi } from '../api/client';
import { DebtStatus, DailySummary } from '../shared-types';
import Layout from '../components/Layout';

export default function DebtManagement() {
  const { profile } = useAuth();
  const [debtStatus, setDebtStatus] = useState<DebtStatus | null>(null);
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [paybackDays, setPaybackDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [debt, summary] = await Promise.all([
        debtApi.getStatus(),
        summaryApi.getToday()
      ]);
      setDebtStatus(debt);
      setDailySummary(summary);
    } catch (error) {
      console.error('Failed to load debt data:', error);
    }
  };

  const handleCreateDebt = async () => {
    if (!dailySummary || dailySummary.remainingCalories >= 0) {
      setError('No overage to create debt from');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const overageCalories = Math.abs(dailySummary.remainingCalories);
      await debtApi.create({
        overageCalories,
        paybackDays
      });
      await loadData();
      setShowCreateForm(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create debt');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDebt = async (debtId: string) => {
    if (!confirm('Are you sure you want to cancel this debt?')) return;

    try {
      await debtApi.cancel(debtId);
      await loadData();
    } catch (error) {
      console.error('Failed to cancel debt:', error);
    }
  };

  if (!debtStatus || !dailySummary || !profile) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </Layout>
    );
  }

  const overage = dailySummary.remainingCalories < 0 ? Math.abs(dailySummary.remainingCalories) : 0;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Calorie Debt Management</h1>

        {/* Explanation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h3 className="font-medium text-blue-900 mb-2">How Calorie Debt Works</h3>
          <p className="text-sm text-blue-800">
            If you go over your daily calorie target, you can create a "debt" to be paid back over several days. 
            Your daily target will be reduced by an equal amount each day until the debt is paid off. This helps 
            you stay on track without feeling guilty about the occasional overage.
          </p>
        </div>

        {/* Current Overage */}
        {overage > 0 && !showCreateForm && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-orange-900">Today's Overage</h3>
                <p className="text-2xl font-bold text-orange-600 mt-2">{overage} calories</p>
                <p className="text-sm text-orange-700 mt-1">
                  You've exceeded your target by {overage} calories today.
                </p>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                Create Debt
              </button>
            </div>
          </div>
        )}

        {/* Create Debt Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create Calorie Debt</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overage Amount
              </label>
              <div className="text-2xl font-bold text-gray-900">{overage} calories</div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payback Period (days)
              </label>
              <input
                type="number"
                value={paybackDays}
                onChange={(e) => setPaybackDays(parseInt(e.target.value))}
                min="1"
                max="30"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <p className="mt-1 text-sm text-gray-600">
                Daily reduction: {Math.round(overage / paybackDays)} calories
              </p>
              <p className="text-sm text-gray-600">
                New daily target: {profile.baseTargetCalories - Math.round(overage / paybackDays)} calories
              </p>
            </div>

            {error && (
              <div className="mb-4 text-red-600 text-sm bg-red-50 p-3 rounded">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleCreateDebt}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Debt'}
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Active Debts */}
        {debtStatus.activeDebts.length > 0 ? (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Active Debts</h3>
              <p className="text-sm text-gray-600 mt-1">
                Total remaining: {debtStatus.totalRemaining} calories • Today's payback: {debtStatus.todayPayback} calories
              </p>
            </div>
            <div className="p-6 space-y-4">
              {debtStatus.activeDebts.map((debt) => {
                const daysRemaining = Math.ceil((new Date(debt.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                const percentPaid = ((debt.totalCalories - debt.remainingCalories) / debt.totalCalories) * 100;

                return (
                  <div key={debt.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-gray-900">
                          {debt.remainingCalories} / {debt.totalCalories} calories remaining
                        </div>
                        <div className="text-sm text-gray-600">
                          Daily payback: {debt.dailyPaybackCalories} calories • {daysRemaining} days left
                        </div>
                      </div>
                      <button
                        onClick={() => handleCancelDebt(debt.id)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${percentPaid}%` }}
                      />
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {percentPaid.toFixed(0)}% paid off
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600">No active debts</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
