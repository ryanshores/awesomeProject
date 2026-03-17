import { useEffect, useState } from 'react';
import { getUsers, updateUser } from '../../api/admin';
import type { User } from '../../types';
import { AdminLayout, PageHeader } from '../../components/layout/AdminLayout';
import { Badge, Spinner, Modal, Button, useToast } from '../../components/ui';

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState<{
    user: User;
    action: 'admin' | 'active';
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers(1, 100);
      setUsers(data.users);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    if (!confirmModal) return;
    setActionLoading(true);
    try {
      const update = confirmModal.action === 'admin'
        ? { is_admin: !confirmModal.user.is_admin }
        : { is_active: !confirmModal.user.is_active };
      
      await updateUser(confirmModal.user.id, update);
      
      setUsers(users.map((u) =>
        u.id === confirmModal.user.id
          ? { ...u, ...update }
          : u
      ));
      
      toast.success(
        confirmModal.action === 'admin'
          ? `Admin status ${confirmModal.user.is_admin ? 'revoked' : 'granted'}`
          : `User ${confirmModal.user.is_active ? 'deactivated' : 'activated'}`
      );
    } catch {
      toast.error('Failed to update user');
    } finally {
      setActionLoading(false);
      setConfirmModal(null);
    }
  };

  return (
    <AdminLayout>
      <PageHeader 
        title="Users" 
        description="Manage user accounts and permissions"
      />

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Admin</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <p className="font-medium text-gray-900">{user.email}</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {user.first_name} {user.last_name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Badge variant={user.is_admin ? 'success' : 'default'}>
                      {user.is_admin ? 'Yes' : 'No'}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Badge variant={user.is_active ? 'success' : 'danger'}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setConfirmModal({ user, action: 'admin' })}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {user.is_admin ? 'Revoke Admin' : 'Make Admin'}
                      </button>
                      <button
                        onClick={() => setConfirmModal({ user, action: 'active' })}
                        className={`font-medium ${
                          user.is_active ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'
                        }`}
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        title={confirmModal?.action === 'admin' ? 'Change Admin Status' : 'Change User Status'}
      >
        <p className="text-gray-600">
          {confirmModal?.action === 'admin'
            ? confirmModal.user.is_admin
              ? `Are you sure you want to revoke admin privileges from "${confirmModal.user.email}"?`
              : `Are you sure you want to grant admin privileges to "${confirmModal.user.email}"?`
            : confirmModal?.user.is_active
              ? `Are you sure you want to deactivate "${confirmModal?.user.email}"? They will not be able to login.`
              : `Are you sure you want to activate "${confirmModal?.user.email}"?`}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirmModal(null)}>
            Cancel
          </Button>
          <Button
            variant={confirmModal?.action === 'active' && confirmModal?.user.is_active ? 'danger' : 'primary'}
            onClick={handleToggle}
            loading={actionLoading}
          >
            Confirm
          </Button>
        </div>
      </Modal>
    </AdminLayout>
  );
}