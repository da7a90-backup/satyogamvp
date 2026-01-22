"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  UserCircleIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  email: string;
  name: string;
  membership_tier: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export default function UsersManagementClient() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    membership_tier: 'FREE',
    is_admin: false,
  });
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [originalTier, setOriginalTier] = useState<string>('');
  const [originalIsAdmin, setOriginalIsAdmin] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [search, tierFilter]);

  const fetchUsers = async () => {
    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      let url = `${FASTAPI_URL}/api/users/admin/users?`;
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (tierFilter !== 'all') url += `membership_tier=${tierFilter}`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${session?.user?.accessToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const response = await fetch(`${FASTAPI_URL}/api/users/admin/stats`, {
        headers: { 'Authorization': `Bearer ${session?.user?.accessToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const openCreateModal = () => {
    setSelectedUser(null);
    setIsCreating(true);
    setFormData({
      name: '',
      email: '',
      membership_tier: 'FREE',
      is_admin: false,
    });
    setReason('');
    setShowModal(true);
  };

  const editUser = (user: User) => {
    setSelectedUser(user);
    setIsCreating(false);
    setFormData({
      name: user.name,
      email: user.email,
      membership_tier: user.membership_tier,
      is_admin: user.is_admin,
    });
    setOriginalTier(user.membership_tier);
    setOriginalIsAdmin(user.is_admin);
    setReason('');
    setShowModal(true);
  };

  const createUser = async () => {
    // Validate required fields
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const response = await fetch(
        `${FASTAPI_URL}/api/users/admin/users`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.user?.accessToken}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        setShowModal(false);
        fetchUsers();
        fetchStats();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const saveUser = async () => {
    if (!selectedUser) return;

    // Check if tier or admin status changed and reason is required
    const tierChanged = formData.membership_tier !== originalTier;
    const adminChanged = formData.is_admin !== originalIsAdmin;

    if ((tierChanged || adminChanged) && !reason.trim()) {
      alert('Please provide a reason for changing membership tier or admin status');
      return;
    }

    setSaving(true);
    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const response = await fetch(
        `${FASTAPI_URL}/api/users/admin/users/${selectedUser.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.user?.accessToken}`,
          },
          body: JSON.stringify({
            ...formData,
            reason: reason.trim() || undefined,
          }),
        }
      );

      if (response.ok) {
        setShowModal(false);
        setReason('');
        fetchUsers();
        fetchStats();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const response = await fetch(
        `${FASTAPI_URL}/api/users/admin/users/${userId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${session?.user?.accessToken}` },
        }
      );

      if (response.ok) {
        fetchUsers();
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const getTierBadge = (tier: string) => {
    const colors: any = {
      FREE: 'bg-gray-100 text-gray-800',
      GYANI: 'bg-blue-100 text-blue-800',
      PRAGYANI: 'bg-purple-100 text-purple-800',
      PRAGYANI_PLUS: 'bg-indigo-100 text-indigo-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[tier] || colors.FREE}`}>
        {tier.replace('_', ' ')}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D1A13]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage user accounts, memberships, and permissions
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-[#7D1A13] hover:bg-[#9d2419] text-white rounded-lg font-medium"
        >
          Create User
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Total Users</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total_users}</div>
          </div>
          {Object.entries(stats.by_membership_tier || {}).map(([tier, count]: any) => (
            <div key={tier} className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">{tier.replace('_', ' ')}</div>
              <div className="text-2xl font-bold text-gray-900">{count}</div>
            </div>
          ))}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Admins</div>
            <div className="text-2xl font-bold text-gray-900">{stats.admin_count}</div>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="mb-4 flex gap-3">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
          />
        </div>
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
        >
          <option value="all">All Tiers</option>
          <option value="FREE">Free</option>
          <option value="GYANI">Gyani</option>
          <option value="PRAGYANI">Pragyani</option>
          <option value="PRAGYANI_PLUS">Pragyani Plus</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membership</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <UserCircleIcon className="w-10 h-10 text-gray-400" />
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getTierBadge(user.membership_tier)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.is_admin ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Admin
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">User</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                  <button
                    onClick={() => editUser(user)}
                    className="text-[#7D1A13] hover:text-[#9d2419]"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No users found
          </div>
        )}
      </div>

      {/* Create/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {isCreating ? 'Create User' : 'Edit User'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Membership Tier</label>
                <select
                  value={formData.membership_tier}
                  onChange={(e) => setFormData({...formData, membership_tier: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13]"
                >
                  <option value="FREE">Free</option>
                  <option value="GYANI">Gyani</option>
                  <option value="PRAGYANI">Pragyani</option>
                  <option value="PRAGYANI_PLUS">Pragyani Plus</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_admin}
                  onChange={(e) => setFormData({...formData, is_admin: e.target.checked})}
                  className="w-4 h-4 text-[#7D1A13] border-gray-300 rounded focus:ring-[#7D1A13]"
                />
                <label className="ml-2 block text-sm text-gray-900">Admin Access</label>
              </div>

              {/* Reason field - shown when tier or admin status changes (edit mode only) */}
              {!isCreating && (formData.membership_tier !== originalTier || formData.is_admin !== originalIsAdmin) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Change <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Explain why you are changing the membership tier or admin status..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    This reason will be logged in the audit trail.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-2 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={isCreating ? createUser : saveUser}
                disabled={saving}
                className="px-4 py-2 bg-[#7D1A13] hover:bg-[#9d2419] disabled:bg-gray-400 text-white rounded-lg"
              >
                {saving ? 'Saving...' : (isCreating ? 'Create User' : 'Save Changes')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
