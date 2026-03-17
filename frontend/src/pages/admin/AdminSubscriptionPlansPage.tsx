import { useState, useEffect } from 'react';
import { createPlan, deletePlan, getPlans, updatePlan } from '../../api/subscriptions';
import type { SubscriptionPlan } from '../../types';
import { AdminLayout, PageHeader } from '../../components/layout/AdminLayout';
import { Button, Input, Textarea, Select, Modal, Spinner, useToast } from '../../components/ui';

export function AdminSubscriptionPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [editing, setEditing] = useState<SubscriptionPlan | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteModal, setDeleteModal] = useState<SubscriptionPlan | null>(null);
  const toast = useToast();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    interval: 'month',
    interval_count: '1',
    features: '',
    trial_period_days: '0',
    is_active: true,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPlans();
      setPlans(data);
    } catch {
      setError('Failed to load subscription plans');
      toast.error('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    if (!form.price || parseFloat(form.price) <= 0) errors.price = 'Price must be greater than 0';
    if (parseInt(form.trial_period_days) < 0) errors.trial_period_days = 'Trial days cannot be negative';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setError(null);
    try {
      const data = {
        name: form.name,
        description: form.description,
        price: Math.round(parseFloat(form.price) * 100),
        interval: form.interval,
        interval_count: parseInt(form.interval_count) || 1,
        features: form.features,
        trial_period_days: parseInt(form.trial_period_days) || 0,
        is_active: form.is_active,
      };

      if (editing) {
        await updatePlan(editing.id, data);
        toast.success('Plan updated successfully');
      } else {
        await createPlan(data);
        toast.success('Plan created successfully');
      }

      setForm({
        name: '',
        description: '',
        price: '',
        interval: 'month',
        interval_count: '1',
        features: '',
        trial_period_days: '0',
        is_active: true,
      });
      setEditing(null);
      setShowForm(false);
      fetchPlans();
    } catch {
      setError('Failed to save plan');
      toast.error('Failed to save plan');
    } finally {
      setSubmitting(false);
    }
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
      is_active: plan.is_active,
    });
    setShowForm(true);
    setFormErrors({});
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(deleteModal.id);
    try {
      await deletePlan(deleteModal.id);
      toast.success('Plan deleted successfully');
      fetchPlans();
    } catch {
      toast.error('Failed to delete plan');
    } finally {
      setDeleting(null);
      setDeleteModal(null);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({
      name: '',
      description: '',
      price: '',
      interval: 'month',
      interval_count: '1',
      features: '',
      trial_period_days: '0',
      is_active: true,
    });
    setFormErrors({});
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Subscription Plans"
        description="Manage subscription plans for your customers"
        actions={
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add Plan'}
          </Button>
        }
      />

      {error && <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">{error}</div>}

      {showForm && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold">
            {editing ? 'Edit Plan' : 'Create Plan'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                error={formErrors.name}
                required
              />
              <Input
                label="Price ($)"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                error={formErrors.price}
                required
              />
              <Select
                label="Interval"
                value={form.interval}
                onChange={(e) => setForm({ ...form, interval: e.target.value })}
                options={[
                  { value: 'day', label: 'Daily' },
                  { value: 'week', label: 'Weekly' },
                  { value: 'month', label: 'Monthly' },
                  { value: 'year', label: 'Yearly' },
                ]}
              />
              <Input
                label="Interval Count"
                type="number"
                min="1"
                value={form.interval_count}
                onChange={(e) => setForm({ ...form, interval_count: e.target.value })}
              />
              <Input
                label="Trial Period (days)"
                type="number"
                min="0"
                value={form.trial_period_days}
                onChange={(e) => setForm({ ...form, trial_period_days: e.target.value })}
                error={formErrors.trial_period_days}
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Active (visible to customers)
                </label>
              </div>
              <Textarea
                label="Features (one per line)"
                value={form.features}
                onChange={(e) => setForm({ ...form, features: e.target.value })}
                className="md:col-span-2"
                helperText="Enter each feature on a new line"
              />
              <Textarea
                label="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="md:col-span-2"
              />
            </div>
            <div className="mt-4 flex gap-3">
              <Button type="submit" loading={submitting}>
                {editing ? 'Update' : 'Create'}
              </Button>
              <Button variant="secondary" onClick={closeForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Billing
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Trial
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{plan.name}</p>
                      {plan.description && (
                        <p className="text-sm text-gray-500">{plan.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    ${(plan.price / 100).toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    Every {plan.interval_count} {plan.interval}
                    {plan.interval_count > 1 ? 's' : ''}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {plan.trial_period_days > 0 ? `${plan.trial_period_days} days` : 'None'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        plan.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {plan.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="mr-3 text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteModal(plan)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {plans.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No subscription plans found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Plan"
      >
        <p className="text-gray-600">
          Are you sure you want to delete "{deleteModal?.name}"? This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteModal(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting === deleteModal?.id}>
            Delete
          </Button>
        </div>
      </Modal>
    </AdminLayout>
  );
}