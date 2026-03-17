import { useEffect, useState } from 'react';
import { getPlans } from '../../api/subscriptions';
import type { SubscriptionPlan } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { createSubscriptionSession } from '../../api/subscriptions';
import { Spinner } from '../../components/ui';

export function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    getPlans()
      .then(setPlans)
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (planId: number) => {
    if (!user) return;
    setSubscribing(planId);
    try {
      const session = await createSubscriptionSession(
        planId,
        window.location.origin + '/dashboard?success=true',
        window.location.origin + '/subscriptions'
      );
      window.location.href = session.url;
    } catch {
      setSubscribing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Subscription Plans
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Choose the plan that works best for you
        </p>
      </div>

      {plans.length === 0 ? (
        <div className="empty-state">
          <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No plans available</h3>
          <p className="mt-1 text-sm text-gray-500">Check back later for subscription options</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="card relative flex flex-col"
            >
              {plan.trial_period_days > 0 && (
                <div className="absolute -top-3 right-4">
                  <span className="badge badge-success">
                    {plan.trial_period_days} days free
                  </span>
                </div>
              )}
              
              <div className="card-body flex-1">
                <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                <p className="mt-2 text-gray-600">{plan.description}</p>
                
                <div className="mt-6">
                  <span className="text-4xl font-bold text-gray-900">
                    ${(plan.price / 100).toFixed(2)}
                  </span>
                  <span className="text-gray-500">
                    /{plan.interval_count > 1 ? plan.interval_count : ''} {plan.interval}
                    {plan.interval_count > 1 ? 's' : ''}
                  </span>
                </div>

                {plan.features && (
                  <ul className="mt-6 space-y-3">
                    {plan.features.split('\n').map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <svg className="h-5 w-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="card-footer">
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={!user || subscribing === plan.id}
                  className="btn btn-primary w-full"
                >
                  {subscribing === plan.id ? (
                    <Spinner size="sm" className="mr-2" />
                  ) : null}
                  {user ? 'Subscribe' : 'Login to Subscribe'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}