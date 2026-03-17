import { useEffect, useState } from 'react';
import { createPlan, deletePlan, getPlans, updatePlan } from '../../api/subscriptions';
import type { SubscriptionPlan } from '../../types';

export function AdminSubscriptionPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SubscriptionPlan | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    interval: 'month',
    interval_count: '1',
    features: '',
    trial_period_days: '0',
  });

  const fetchPlans = () => {
    getPlans().then((data) => {
      setPlans(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: form.name,
      description: form.description,
      price: Math.round(Number(form.price) * 100),
      interval: form.interval,
      interval_count: Number(form.interval_count),
      features: form.features,
      trial_period_days: Number(form.trial_period_days),
    };

    if (editing) {
      await updatePlan(editing.id, data);
    } else {
      await createPlan(data);
    }

    setForm({ name: '', description: '', price: '', interval: 'month', interval_count: '1', features: '', trial_period_days: '0' });
    setEditing(null);
    setShowForm(false);
    fetchPlans();
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditing(plan);
    setForm({
      name: plan.name,
      description: plan.description,
      price: (plan.price / 100).toString(),
      interval: plan.interval,
      interval_count: plan.interval_count.toString(),
      features: plan.features,
      trial_period_days: plan.trial_period_days.toString(),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure?')) {
      await deletePlan(id);
      fetchPlans();
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Subscription Plans</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditing(null);
            setForm({ name: '', description: '', price: '', interval: 'month', interval_count: '1', features: '', trial_period_days: '0' });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Add Plan'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border rounded px-3 py-2"
              required
            />
            <input
              placeholder="Price"
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="border rounded px-3 py-2"
              required
            />
            <select
              value={form.interval}
              onChange={(e) => setForm({ ...form, interval: e.target.value })}
              className="border rounded px-3 py-2"
            >
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
            </select>
            <input
              placeholder="Interval Count"
              type="number"
              value={form.interval_count}
              onChange={(e) => setForm({ ...form, interval_count: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <input
              placeholder="Trial Period (days)"
              type="number"
              value={form.trial_period_days}
              onChange={(e) => setForm({ ...form, trial_period_days: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <textarea
              placeholder="Features"
              value={form.features}
              onChange={(e) => setForm({ ...form, features: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="border rounded px-3 py-2"
            />
          </div>
          <button type="submit" className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
            {editing ? 'Update' : 'Create'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Price</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Interval</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Trial</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {plans.map((plan) => (
              <tr key={plan.id}>
                <td className="px-6 py-4">{plan.name}</td>
                <td className="px-6 py-4">${(plan.price / 100).toFixed(2)}</td>
                <td className="px-6 py-4">{plan.interval_count} {plan.interval}(s)</td>
                <td className="px-6 py-4">{plan.trial_period_days} days</td>
                <td className="px-6 py-4 space-x-2">
                  <button onClick={() => handleEdit(plan)} className="text-blue-600 hover:text-blue-800">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(plan.id)} className="text-red-600 hover:text-red-800">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}