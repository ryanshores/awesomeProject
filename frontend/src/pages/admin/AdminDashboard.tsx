import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../../api/admin';

export function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, users: 0, orders: 0, subscriptions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard().then((data) => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/admin/products" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <h2 className="text-lg font-semibold">Products</h2>
          <p className="text-3xl font-bold mt-2">{stats.products}</p>
        </Link>
        <Link to="/admin/users" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <h2 className="text-lg font-semibold">Users</h2>
          <p className="text-3xl font-bold mt-2">{stats.users}</p>
        </Link>
        <Link to="/admin/orders" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <h2 className="text-lg font-semibold">Orders</h2>
          <p className="text-3xl font-bold mt-2">{stats.orders}</p>
        </Link>
        <Link to="/admin/subscriptions" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <h2 className="text-lg font-semibold">Subscriptions</h2>
          <p className="text-3xl font-bold mt-2">{stats.subscriptions}</p>
        </Link>
      </div>
    </div>
  );
}