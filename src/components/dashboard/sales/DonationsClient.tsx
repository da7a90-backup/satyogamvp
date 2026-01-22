'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import { syncSessionToLocalStorage } from '@/lib/auth-sync';

interface Donation {
  id: string;
  user_email: string;
  user_name: string;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  transaction_id?: string;
  message?: string;
}

export default function DonationsClient() {
  const { data: session } = useSession();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync session token to localStorage for API calls
  useEffect(() => {
    syncSessionToLocalStorage(session);
  }, [session]);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/payments/donations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch donations');
      }

      const data = await response.json();

      // Transform payment data to donation format
      const transformedDonations: Donation[] = data.map((payment: any) => ({
        id: payment.id,
        user_email: payment.user?.email || 'Anonymous',
        user_name: payment.user?.name || 'Anonymous Donor',
        amount: payment.amount,
        status: payment.status,
        payment_method: payment.payment_method || 'Tilopay',
        created_at: payment.created_at,
        transaction_id: payment.tilopay_order_number,
        message: payment.donation_message,
      }));

      setDonations(transformedDonations);
    } catch (err) {
      console.error('Failed to fetch donations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load donations');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchDonations(true);
  };

  // Filter donations
  const filteredDonations = donations.filter((donation) => {
    const matchesSearch =
      donation.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (donation.transaction_id && donation.transaction_id.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  // Calculate totals
  const totalDonations = filteredDonations
    .filter(d => d.status === 'completed')
    .reduce((sum, donation) => sum + donation.amount, 0);
  const donationCount = filteredDonations.filter(d => d.status === 'completed').length;
  const averageDonation = donationCount > 0 ? totalDonations / donationCount : 0;

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
            onClick={() => fetchDonations()}
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
          <h1 className="text-2xl font-bold text-[#1F2937]">Donations</h1>
          <p className="text-[#737373] mt-1">Manage and track all donations</p>
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
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#737373]">Total Donations</p>
              <p className="text-2xl font-bold mt-1 text-[#1F2937]">
                ${totalDonations.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#FEF2F2]">
              <HeartIcon className="h-8 w-8 text-[#7D1A13]" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-[#F3F4F6] shadow-sm p-5">
          <p className="text-sm font-medium text-[#737373]">Number of Donors</p>
          <p className="text-2xl font-bold mt-1 text-[#1F2937]">{donationCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-[#F3F4F6] shadow-sm p-5">
          <p className="text-sm font-medium text-[#737373]">Average Donation</p>
          <p className="text-2xl font-bold mt-1 text-[#1F2937]">
            ${averageDonation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-[#F3F4F6] shadow-sm p-4 mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#737373]" />
          <input
            type="text"
            placeholder="Search by donor name, email, or transaction ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
          />
        </div>
      </div>

      {/* Donations List */}
      <div className="bg-white rounded-lg border border-[#F3F4F6] shadow-sm overflow-hidden">
        <div className="divide-y divide-[#F3F4F6]">
          {filteredDonations.length === 0 ? (
            <div className="px-6 py-12 text-center text-[#737373]">
              <HeartIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No donations found</p>
            </div>
          ) : (
            filteredDonations.map((donation) => (
              <div key={donation.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-10 w-10 bg-[#FEF2F2] rounded-full flex items-center justify-center">
                        <HeartIcon className="h-5 w-5 text-[#7D1A13]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1F2937]">{donation.user_name}</p>
                        <p className="text-sm text-[#737373]">{donation.user_email}</p>
                      </div>
                    </div>
                    {donation.message && (
                      <div className="mt-2 ml-13">
                        <p className="text-sm text-[#737373] italic">"{donation.message}"</p>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#1F2937]">
                      ${donation.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-[#737373]">
                      {new Date(donation.created_at).toLocaleDateString()}
                    </p>
                    {donation.transaction_id && (
                      <p className="text-xs text-[#737373] mt-1">
                        ID: {donation.transaction_id}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
