import { useEffect, useState } from 'react';
import { getPlans } from '../../api/subscriptions';
import type { SubscriptionPlan } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { createSubscriptionSession } from '../../api/subscriptions';

export function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    getPlans().then((data) => {
      setPlans(data);
      setLoading(false);
    });
  }, []);

  const handleSubscribe = async (planId: number) => {
    if (!user) return;
    const session = await createSubscriptionSession(
      planId,
      window.location.origin + '/dashboard?success=true',
      window.location.origin + '/subscriptions'
    );
    window.location.href = session.url;
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Subscription Plans</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-2">{plan.name}</h2>
            <p className="text-gray-600 mb-4">{plan.description}</p>
            <p className="text-3xl font-bold mb-4">
              ${(plan.price / 100).toFixed(2)}
              <span className="text-sm font-normal text-gray-500">
                /{plan.interval}
              </span>
            </p>
            <p className="text-sm text-gray-600 mb-4">{plan.features}</p>
            {plan.trial_period_days > 0 && (
              <p className="text-sm text-green-600 mb-4">
                {plan.trial_period_days} day free trial
              </p>
            )}
            <button
              onClick={() => handleSubscribe(plan.id)}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Subscribe
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}