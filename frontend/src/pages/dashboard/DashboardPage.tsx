import { useState } from 'react';
import { useEffect } from 'react';
import { getUserSubscriptions } from '../../api/subscriptions';
import type { Subscription } from '../../types';
import { Spinner, StatusBadge } from '../../components/ui';

export function DashboardPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserSubscriptions()
      .then(setSubscriptions)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active' || s.status === 'trialing');
  const pastSubscriptions = subscriptions.filter(s => s.status !== 'active' && s.status !== 'trialing');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">Manage your account and subscriptions</p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Subscriptions</h2>
          {activeSubscriptions.length === 0 ? (
            <div className="card">
              <div className="empty-state py-8">
            <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No active subscriptions</h3>
            <p className="mt-1 text-sm text-gray-500">Subscribe to a plan to get started</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {activeSubscriptions.map((sub) => (
                <div key={sub.id} className="card">
                  <div className="card-body flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{sub.plan?.name}</h3>
                      <p className="text-sm text-gray-500">
                        {sub.current_period_end && (
                          <>Next billing: {new Date(sub.current_period_end).toLocaleDateString()}</>
                        )}
                      </p>
                    </div>
                    <StatusBadge status={sub.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {pastSubscriptions.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Past Subscriptions</h2>
            <div className="space-y-4">
              {pastSubscriptions.map((sub) => (
                <div key={sub.id} className="card opacity-75">
                  <div className="card-body flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{sub.plan?.name}</h3>
                    </div>
                    <StatusBadge status={sub.status} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}