"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  subscribed_at: string;
  unsubscribed_at: string | null;
  status: string;
  tags: string[];
}

export default function EmailSubscribersClient() {
  const { data: session } = useSession();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // Only fetch when session is loaded and has accessToken
    if (session?.user?.accessToken) {
      fetchSubscribers();
    } else if (session && !session.user?.accessToken) {
      // Session loaded but no token - stop loading
      setLoading(false);
    }
  }, [statusFilter, session]);

  const fetchSubscribers = async () => {
    if (!session?.user?.accessToken) {
      console.error('No access token available');
      setLoading(false);
      return;
    }

    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const params = new URLSearchParams();

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`${FASTAPI_URL}/api/email/subscribers?${params}`, {
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscribers(data);
      } else {
        console.error('Failed to fetch subscribers:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Email', 'Name', 'Status', 'Subscribed At', 'Unsubscribed At'].join(','),
      ...filteredSubscribers.map(sub => [
        sub.email,
        sub.name || '',
        sub.status,
        new Date(sub.subscribed_at).toLocaleDateString(),
        sub.unsubscribed_at ? new Date(sub.unsubscribed_at).toLocaleDateString() : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      unsubscribed: 'bg-gray-100 text-[#1F2937]',
      bounced: 'bg-red-100 text-red-800',
    };

    const icons = {
      active: <CheckIcon className="w-4 h-4" />,
      unsubscribed: <XMarkIcon className="w-4 h-4" />,
      bounced: <XMarkIcon className="w-4 h-4" />,
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${colors[status as keyof typeof colors] || colors.active}`}>
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredSubscribers = subscribers.filter(sub =>
    sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sub.name && sub.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    total: subscribers.length,
    active: subscribers.filter(s => s.status === 'active').length,
    unsubscribed: subscribers.filter(s => s.status === 'unsubscribed').length,
    bounced: subscribers.filter(s => s.status === 'bounced').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#737373]">Loading subscribers...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1F2937]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>Newsletter Subscribers</h1>
        <p className="text-[#737373] mt-1">Manage your email subscriber list</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-[#737373]">Total Subscribers</div>
          <div className="text-2xl font-bold text-[#1F2937] mt-1" style={{ fontFamily: 'Avenir Next, sans-serif' }}>{stats.total}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-[#737373]">Active</div>
          <div className="text-2xl font-bold text-green-600 mt-1" style={{ fontFamily: 'Avenir Next, sans-serif' }}>{stats.active}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-[#737373]">Unsubscribed</div>
          <div className="text-2xl font-bold text-[#737373] mt-1" style={{ fontFamily: 'Avenir Next, sans-serif' }}>{stats.unsubscribed}</div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-[#737373]">Bounced</div>
          <div className="text-2xl font-bold text-red-600 mt-1" style={{ fontFamily: 'Avenir Next, sans-serif' }}>{stats.bounced}</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by email or name..."
              className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-[#737373]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-[#E5E7EB] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="unsubscribed">Unsubscribed</option>
              <option value="bounced">Bounced</option>
            </select>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center px-4 py-2 bg-gray-100 text-[#374151] rounded-lg hover:bg-gray-200 transition"
          >
            <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Subscribers Table */}
      {filteredSubscribers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-[#737373]">
            {searchTerm ? 'No subscribers match your search' : 'No subscribers found'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#737373] uppercase tracking-wider">
                  Subscriber
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#737373] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#737373] uppercase tracking-wider">
                  Subscribed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#737373] uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#737373] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubscribers.map((subscriber) => (
                <tr key={subscriber.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-[#1F2937]">{subscriber.email}</div>
                      {subscriber.name && (
                        <div className="text-sm text-[#737373]">{subscriber.name}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(subscriber.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#737373]">
                    {new Date(subscriber.subscribed_at).toLocaleDateString()}
                    {subscriber.unsubscribed_at && (
                      <div className="text-xs text-gray-400">
                        Unsubscribed: {new Date(subscriber.unsubscribed_at).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {subscriber.tags && subscriber.tags.length > 0 ? (
                        subscriber.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">No tags</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <Link
                      href={`/dashboard/admin/email/subscribers/${subscriber.id}`}
                      className="text-[#7D1A13] hover:text-blue-900"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination placeholder */}
      {filteredSubscribers.length > 0 && (
        <div className="mt-4 flex justify-between items-center text-sm text-[#737373]">
          <div>Showing {filteredSubscribers.length} of {subscribers.length} subscribers</div>
          <div className="flex gap-2">
            {/* TODO: Add pagination controls */}
          </div>
        </div>
      )}
    </div>
  );
}
