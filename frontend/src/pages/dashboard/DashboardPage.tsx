import { useEffect, useState } from 'react';
import { getUserSubscriptions } from '../../api/subscriptions';
import type { Subscription } from '../../types';

export function DashboardPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserSubscriptions().then((data) => {
      setSubscriptions(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Your Subscriptions</h2>
        {subscriptions.length === 0 ? (
          <p className="text-gray-600">No active subscriptions</p>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="border rounded p-4">
                <div className="flex justify-between">
                  <span className="font-semibold">{sub.plan?.name || 'Unknown Plan'}</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    sub.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {sub.status}
                  </span>
                </div>
                {sub.current_period_end && (
                  <p className="text-sm text-gray-600 mt-2">
                    Next billing: {new Date(sub.current_period_end).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}