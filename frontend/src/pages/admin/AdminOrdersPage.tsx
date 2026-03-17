import { useEffect, useState } from 'react';
import { getUsers, updateUser } from '../../api/admin';
import type { User } from '../../types';

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers(1, 100).then((data) => {
      setUsers(data.users);
      setLoading(false);
    });
  }, []);

  const toggleAdmin = async (user: User) => {
    await updateUser(user.id, { is_admin: !user.is_admin });
    setUsers(users.map((u) => (u.id === user.id ? { ...u, is_admin: !u.is_admin } : u)));
  };

  const toggleActive = async (user: User) => {
    await updateUser(user.id, { is_active: !user.is_active });
    setUsers(users.map((u) => (u.id === user.id ? { ...u, is_active: !u.is_active } : u)));
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Users</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Admin</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Active</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">{user.first_name} {user.last_name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs ${user.is_admin ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                    {user.is_admin ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 space-x-2">
                  <button onClick={() => toggleAdmin(user)} className="text-blue-600 hover:text-blue-800">
                    Toggle Admin
                  </button>
                  <button onClick={() => toggleActive(user)} className="text-red-600 hover:text-red-800">
                    Toggle Active
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