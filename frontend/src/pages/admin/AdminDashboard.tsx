import { useEffect, useState } from 'react';
import { getDashboard } from '../../api/admin';
import { Link } from 'react-router-dom';
import { AdminLayout, PageHeader } from '../../components/layout/AdminLayout';
import { Spinner } from '../../components/ui';

export function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, users: 0, orders: 0, subscriptions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Products', key: 'products', href: '/admin/products', color: 'bg-blue-500' },
    { label: 'Users', key: 'users', href: '/admin/users', color: 'bg-green-500' },
    { label: 'Orders', key: 'orders', href: '/admin/orders', color: 'bg-purple-500' },
    { label: 'Subscriptions', key: 'subscriptions', href: '/admin/subscriptions', color: 'bg-orange-500' },
  ];

  return (
    <AdminLayout>
      <PageHeader 
        title="Dashboard" 
        description="Overview of your store"
      />
      
      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
              <Link
                key={card.key}
                to={card.href}
                className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow transition-all hover:shadow-lg"
              >
                <dt className="truncate text-sm font-medium text-gray-500">{card.label}</dt>
                <dd className="mt-1 flex items-baseline justify-between">
                  <span className="text-3xl font-semibold text-gray-900">
                    {stats[card.key as keyof typeof stats]}
                  </span>
                </dd>
                <div className={`absolute top-0 right-0 h-16 w-16 ${card.color} opacity-10 rounded-bl-full`} />
              </Link>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link to="/admin/products" className="block text-blue-600 hover:text-blue-800">
                  + Add new product
                </Link>
                <Link to="/admin/subscriptions" className="block text-blue-600 hover:text-blue-800">
                  + Create subscription plan
                </Link>
                <Link to="/admin/orders" className="block text-blue-600 hover:text-blue-800">
                  View recent orders
                </Link>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h2>
              <div className="space-y-3 text-sm text-gray-600">
                <p>1. Add products to your store</p>
                <p>2. Create subscription plans for recurring revenue</p>
                <p>3. Configure Stripe webhooks for payment processing</p>
                <p>4. Set up email notifications for orders</p>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}