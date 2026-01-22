'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { syncSessionToLocalStorage } from '@/lib/auth-sync';

interface Order {
  id: string;
  user_email: string;
  user_name: string;
  order_type: string;
  item_name: string;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  transaction_id?: string;
}

const ORDER_TYPES = ['All', 'Product', 'Course', 'Retreat', 'Membership'];
const ORDER_STATUS = ['All', 'Completed', 'Pending', 'Failed'];

export default function SalesClient() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync session token to localStorage for API calls
  useEffect(() => {
    syncSessionToLocalStorage(session);
  }, [session]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/payments/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();

      // Transform payment data to order format
      const transformedOrders: Order[] = data.map((payment: any) => ({
        id: payment.id,
        user_email: payment.user?.email || 'N/A',
        user_name: payment.user?.name || 'N/A',
        order_type: payment.order_type || 'Product',
        item_name: payment.product?.name || payment.course?.name || payment.retreat?.name || 'N/A',
        amount: payment.amount,
        status: payment.status,
        payment_method: payment.payment_method || 'Tilopay',
        created_at: payment.created_at,
        transaction_id: payment.tilopay_order_number,
      }));

      setOrders(transformedOrders);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchOrders(true);
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.transaction_id && order.transaction_id.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === 'All' || order.order_type === selectedType;
    const matchesStatus = selectedStatus === 'All' || order.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate totals
  const totalRevenue = filteredOrders
    .filter(o => o.status === 'completed')
    .reduce((sum, order) => sum + order.amount, 0);
  const totalOrders = filteredOrders.length;
  const completedOrders = filteredOrders.filter(o => o.status === 'completed').length;

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="h-3 w-3 mr-1" />
            Completed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="h-3 w-3 mr-1" />
            Failed
          </span>
        );
      default:
        return <span className="text-sm text-[#737373]">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D1A13]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchOrders()}
            className="px-4 py-2 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6B1710]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">Sales & Orders</h1>
          <p className="text-[#737373] mt-1">Manage all orders and transactions</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-4 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#374151] hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="bg-white rounded-lg border border-[#F3F4F6] shadow-sm p-5">
          <p className="text-sm font-medium text-[#737373]">Total Revenue</p>
          <p className="text-2xl font-bold mt-1 text-[#1F2937]">
            ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-[#F3F4F6] shadow-sm p-5">
          <p className="text-sm font-medium text-[#737373]">Total Orders</p>
          <p className="text-2xl font-bold mt-1 text-[#1F2937]">{totalOrders}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#F3F4F6] shadow-sm p-5">
          <p className="text-sm font-medium text-[#737373]">Completed</p>
          <p className="text-2xl font-bold mt-1 text-[#1F2937]">{completedOrders}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-[#F3F4F6] shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#737373]" />
            <input
              type="text"
              placeholder="Search by email, name, or transaction ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#737373]" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent appearance-none bg-white"
            >
              {ORDER_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type === 'All' ? 'All Types' : type}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#737373]" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent appearance-none bg-white"
            >
              {ORDER_STATUS.map((status) => (
                <option key={status} value={status}>
                  {status === 'All' ? 'All Status' : status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-[#F3F4F6] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#F3F4F6]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#737373] uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#737373] uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#737373] uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#737373] uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#737373] uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#737373] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#737373] uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#F3F4F6]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[#737373]">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1F2937]">
                      {order.transaction_id || order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#1F2937]">{order.user_name}</div>
                      <div className="text-sm text-[#737373]">{order.user_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {order.order_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#1F2937]">{order.item_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[#1F2937]">
                      ${order.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(order.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#737373]">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
