'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { getAuditLogs, formatActionType, getActionTypeColor } from '@/lib/audit-api';
import type { AuditLog, ActionType } from '@/types/audit';

export default function AuditLogClient() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [actionTypeFilter, setActionTypeFilter] = useState<string>('all');
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Expanded logs (for showing detailed changes)
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchLogs();
  }, [currentPage, actionTypeFilter, entityTypeFilter, searchQuery, startDate, endDate]);

  const fetchLogs = async () => {
    if (!session?.user?.accessToken) return;

    setLoading(true);
    try {
      const filters: any = {
        skip: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
      };

      if (actionTypeFilter !== 'all') filters.action_type = actionTypeFilter;
      if (entityTypeFilter !== 'all') filters.entity_type = entityTypeFilter;
      if (searchQuery) filters.search = searchQuery;
      if (startDate) filters.start_date = new Date(startDate).toISOString();
      if (endDate) filters.end_date = new Date(endDate).toISOString();

      const response = await getAuditLogs(session.user.accessToken, filters);
      setLogs(response.logs);
      setTotal(response.total);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalPages = Math.ceil(total / itemsPerPage);

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D1A13]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
        <p className="mt-1 text-sm text-gray-600">
          Comprehensive audit trail of all admin actions in the system
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Actions</div>
          <div className="text-2xl font-bold text-gray-900">{total.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Page</div>
          <div className="text-2xl font-bold text-gray-900">
            {currentPage} of {totalPages}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Showing</div>
          <div className="text-2xl font-bold text-gray-900">
            {logs.length} logs
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FunnelIcon className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search reason, names..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13]"
              />
            </div>
          </div>

          {/* Action Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
            <select
              value={actionTypeFilter}
              onChange={(e) => {
                setActionTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13]"
            >
              <option value="all">All Actions</option>
              <option value="user_created">User Created</option>
              <option value="user_updated">User Updated</option>
              <option value="user_deleted">User Deleted</option>
              <option value="membership_tier_changed">Tier Changed</option>
              <option value="admin_promoted">Admin Promoted</option>
              <option value="admin_demoted">Admin Demoted</option>
              <option value="teaching_created">Teaching Created</option>
              <option value="course_created">Course Created</option>
              <option value="product_created">Product Created</option>
              <option value="retreat_created">Retreat Created</option>
            </select>
          </div>

          {/* Entity Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
            <select
              value={entityTypeFilter}
              onChange={(e) => {
                setEntityTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13]"
            >
              <option value="all">All Entities</option>
              <option value="user">User</option>
              <option value="teaching">Teaching</option>
              <option value="course">Course</option>
              <option value="product">Product</option>
              <option value="retreat">Retreat</option>
              <option value="event">Event</option>
              <option value="form">Form</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex-1 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] text-sm"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex-1 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] text-sm"
              />
            </div>
          </div>
        </div>

        {/* Clear Filters */}
        {(searchQuery || actionTypeFilter !== 'all' || entityTypeFilter !== 'all' || startDate || endDate) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setActionTypeFilter('all');
              setEntityTypeFilter('all');
              setStartDate('');
              setEndDate('');
              setCurrentPage(1);
            }}
            className="mt-4 text-sm text-[#7D1A13] hover:text-[#9d2419] font-medium"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => {
                const isExpanded = expandedLogs.has(log.id);
                return (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 text-gray-400" />
                        {formatDate(log.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{log.admin_name}</div>
                      <div className="text-xs text-gray-500">{log.admin_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionTypeColor(log.action_type)}`}>
                        {formatActionType(log.action_type)}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">{log.entity_type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.target_user_name ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">{log.target_user_name}</div>
                          <div className="text-xs text-gray-500">{log.target_user_email}</div>
                        </div>
                      ) : log.entity_name ? (
                        <div className="text-sm text-gray-900">{log.entity_name}</div>
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="text-sm text-gray-700 line-clamp-2">
                        {log.reason || <span className="text-gray-400 italic">No reason provided</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {log.changes && Object.keys(log.changes).length > 0 && (
                        <button
                          onClick={() => toggleExpanded(log.id)}
                          className="inline-flex items-center text-[#7D1A13] hover:text-[#9d2419]"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUpIcon className="w-4 h-4 mr-1" />
                              Hide
                            </>
                          ) : (
                            <>
                              <ChevronDownIcon className="w-4 h-4 mr-1" />
                              Show
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Expanded Details */}
        {logs.map((log) => {
          if (!expandedLogs.has(log.id) || !log.changes) return null;

          return (
            <div key={`${log.id}-details`} className="border-t border-gray-200 bg-gray-50 px-6 py-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Change Details:</h4>
              <div className="space-y-2">
                {Object.entries(log.changes).map(([field, change]) => (
                  <div key={field} className="flex items-start gap-4 text-sm">
                    <span className="font-medium text-gray-700 capitalize min-w-[120px]">{field}:</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded">
                          {JSON.stringify(change.before)}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                          {JSON.stringify(change.after)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {log.ip_address && (
                <div className="mt-3 text-xs text-gray-500">
                  IP: {log.ip_address}
                </div>
              )}
            </div>
          );
        })}

        {/* Empty State */}
        {logs.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-500">
            <ClockIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No audit logs found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, total)} of {total} logs
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }

                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 border rounded-lg ${
                      currentPage === page
                        ? 'bg-[#7D1A13] text-white border-[#7D1A13]'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
