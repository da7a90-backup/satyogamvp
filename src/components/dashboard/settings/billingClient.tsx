'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DownloadCloud } from 'lucide-react';

interface SubscriptionPlan {
  name: string;
  status: string;
  billing_cycle: string;
  amount: number;
  next_billing_date: string | null;
}

interface PaymentHistory {
  id: string;
  created_at: string;
  description: string;
  amount: number;
  status: string;
  invoice_url?: string;
}

interface UserData {
  membership_tier: string;
  subscription_status?: string;
}

export default function BillingClient() {
  const router = useRouter();
  const { data: session } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchBillingData = async () => {
      if (!session?.user?.accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

        // Fetch user data with subscription status
        const userResponse = await fetch(`${FASTAPI_URL}/api/payments/subscription/current`, {
          headers: {
            'Authorization': `Bearer ${session.user.accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (userResponse.ok) {
          const data = await userResponse.json();
          setUserData({
            membership_tier: data.membership_tier,
            subscription_status: data.status,
          });
        }

        // Fetch user's purchases (payment history)
        const paymentsResponse = await fetch(`${FASTAPI_URL}/api/users/me/purchases`, {
          headers: {
            'Authorization': `Bearer ${session.user.accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (paymentsResponse.ok) {
          const purchases = await paymentsResponse.json();
          // Map purchases to payment history format
          const payments = purchases.map((purchase: any) => ({
            id: purchase.id,
            created_at: purchase.purchased_at || purchase.created_at,
            description: `${purchase.item_type} - ${purchase.title}`,
            amount: parseFloat(purchase.amount || purchase.price || 0),
            status: purchase.payment_status || 'COMPLETED',
          }));
          setPaymentHistory(payments);
        }
      } catch (err) {
        console.error('Error fetching billing data:', err);
        setError('Failed to load billing information');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBillingData();
  }, [session]);

  const getTierInfo = (tier: string) => {
    const tiers: Record<string, { amount: number; description: string }> = {
      'FREE': { amount: 0, description: 'Basic access to select teachings' },
      'GYANI': { amount: 15, description: 'Access to mid-tier teachings' },
      'PRAGYANI': { amount: 47, description: 'Full access to all teachings' },
      'PRAGYANI_PLUS': { amount: 97, description: 'Premium access with exclusive content' },
    };
    return tiers[tier] || tiers['FREE'];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D1A13]"></div>
      </div>
    );
  }

  const tierInfo = userData ? getTierInfo(userData.membership_tier) : { amount: 0, description: '' };

  // Calculate pagination
  const totalPages = Math.ceil(paymentHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = paymentHistory.slice(startIndex, endIndex);

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="font-avenir text-lg font-semibold leading-7 text-[#181D27]">
          Pricing plan
        </h2>
        <p className="mt-0.5 font-avenir text-sm leading-5 text-[#535862]">
          Our most popular plan for teams and organizations
        </p>
      </div>

      {/* Pricing Card */}
      {userData && (
        <div className="mb-8 bg-white border border-[#E9EAEB] rounded-xl shadow-[0px_1px_2px_rgba(10,13,18,0.05)]">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
              {/* Plan info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-avenir text-lg font-semibold leading-7 text-[#181D27]">
                    {userData.membership_tier}
                  </h3>
                  <span className="inline-flex items-center px-2 py-0.5 bg-white border border-[#D5D7DA] rounded-md shadow-[0px_1px_2px_rgba(10,13,18,0.05)] font-avenir text-sm font-medium leading-5 text-[#414651]">
                    Our most popular plan
                  </span>
                </div>
                <p className="font-avenir text-sm leading-5 text-[#535862]">
                  {tierInfo.description}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-end gap-0.5">
                <span className="font-optima text-4xl font-[550] leading-[44px] tracking-[-0.02em] text-[#181D27] pb-1">
                  $
                </span>
                <span className="font-optima text-5xl font-[550] leading-[60px] tracking-[-0.02em] text-[#181D27]">
                  {tierInfo.amount}
                </span>
                <span className="font-avenir text-base font-medium leading-6 text-[#535862] pb-2">
                  /per month
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-[#E9EAEB] px-6 py-4 flex justify-end">
            <button
              onClick={() => router.push('/membership')}
              className="font-avenir text-sm font-semibold leading-5 text-[#7D1A13] hover:text-[#942017] transition-colors cursor-pointer"
            >
              Upgrade plan →
            </button>
          </div>
        </div>
      )}

      {/* Payment Method Section */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start gap-5 py-5 border-b border-[#E9EAEB]">
        <label className="font-avenir text-sm font-medium leading-5 text-[#414651] sm:min-w-[280px]">
          Payment method<br />
          <span className="font-normal text-[#535862]">Change how you pay for your plan.</span>
        </label>

        <div className="flex-1 bg-white border border-[#E9EAEB] rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            {/* VISA Logo */}
            <div className="w-[58px] h-10 bg-white border border-[#F5F5F5] rounded-md flex items-center justify-center flex-shrink-0">
              <span className="font-avenir text-xs font-semibold text-[#172B85]">VISA</span>
            </div>

            {/* Card Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-avenir text-sm font-medium leading-5 text-[#414651]">
                    Visa ending in 1234
                  </p>
                  <p className="font-avenir text-sm leading-5 text-[#535862]">
                    Expiry 06/2024
                  </p>
                </div>
                <button className="px-3.5 py-2.5 bg-white border border-[#D5D7DA] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05),inset_0px_0px_0px_1px_rgba(10,13,18,0.18),inset_0px_-2px_0px_rgba(10,13,18,0.05)] font-avenir text-sm font-semibold leading-5 text-[#414651] hover:bg-[#F5F5F6] transition-colors">
                  Edit
                </button>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-[#E9EAEB]">
                <p className="font-avenir text-sm leading-5 text-[#535862]">
                  <span className="inline-block w-3.5 h-3.5 mr-1">📧</span>
                  billing@untitledui.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Billing History Section */}
      <div className="mb-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
          <div>
            <h3 className="font-avenir text-lg font-semibold leading-7 text-[#181D27]">
              Billing and invoicing
            </h3>
            <p className="font-avenir text-sm leading-5 text-[#535862]">
              Manage your billing information and invoices
            </p>
          </div>
          <button className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-[#D5D7DA] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05),inset_0px_0px_0px_1px_rgba(10,13,18,0.18),inset_0px_-2px_0px_rgba(10,13,18,0.05)] font-avenir text-sm font-semibold leading-5 text-[#414651] hover:bg-[#F5F5F6] transition-colors">
            <DownloadCloud className="w-5 h-5" />
            <span>Download all</span>
          </button>
        </div>

        {/* Table */}
        {paymentHistory.length > 0 ? (
          <>
            <div className="bg-white border border-[#E9EAEB] rounded-xl shadow-[0px_1px_2px_rgba(10,13,18,0.05)] overflow-hidden">
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F5F5F6]">
                    <tr>
                      <th className="px-6 py-3 text-left font-avenir text-xs font-medium leading-[18px] text-[#535862]">Invoice</th>
                      <th className="px-6 py-3 text-left font-avenir text-xs font-medium leading-[18px] text-[#535862]">Billing date</th>
                      <th className="px-6 py-3 text-left font-avenir text-xs font-medium leading-[18px] text-[#535862]">Status</th>
                      <th className="px-6 py-3 text-left font-avenir text-xs font-medium leading-[18px] text-[#535862]">Amount</th>
                      <th className="px-6 py-3 text-left font-avenir text-xs font-medium leading-[18px] text-[#535862]">Type</th>
                      <th className="px-6 py-3 text-right font-avenir text-xs font-medium leading-[18px] text-[#535862]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9EAEB]">
                    {currentItems.map((payment) => (
                      <tr key={payment.id} className="hover:bg-[#FAF8F1] transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-avenir text-sm font-medium leading-5 text-[#181D27]">
                            {payment.description}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-avenir text-sm leading-5 text-[#535862]">
                            {new Date(payment.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-0.5 gap-1.5 bg-[#ECFDF3] border border-[#ABEFC6] rounded-full font-avenir text-xs font-medium leading-[18px] text-[#067647]">
                            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                              <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Paid
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-avenir text-sm leading-5 text-[#535862]">
                            USD ${payment.amount.toFixed(2)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-avenir text-sm leading-5 text-[#535862]">
                            Digital product
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="font-avenir text-sm font-semibold leading-5 text-[#7D1A13] hover:text-[#942017] transition-colors">
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden divide-y divide-[#E9EAEB]">
                {currentItems.map((payment) => (
                  <div key={payment.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <p className="font-avenir text-sm font-medium leading-5 text-[#181D27] mb-1">
                          {payment.description}
                        </p>
                        <p className="font-avenir text-sm leading-5 text-[#535862]">
                          {new Date(payment.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 gap-1.5 bg-[#ECFDF3] border border-[#ABEFC6] rounded-full font-avenir text-xs font-medium leading-[18px] text-[#067647]">
                        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                          <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Paid
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-[#E9EAEB]">
                      <p className="font-avenir text-sm leading-5 text-[#535862]">
                        USD ${payment.amount.toFixed(2)}
                      </p>
                      <button className="font-avenir text-sm font-semibold leading-5 text-[#7D1A13] hover:text-[#942017] transition-colors">
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#E9EAEB]">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-[#D5D7DA] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] font-avenir text-sm font-semibold leading-5 text-[#414651] hover:bg-[#F5F5F6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
                    <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg font-avenir text-sm font-medium leading-5 transition-colors ${
                        page === currentPage
                          ? 'bg-[#F5F5F6] text-[#181D27]'
                          : 'text-[#535862] hover:bg-[#F5F5F6]'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-[#D5D7DA] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05)] font-avenir text-sm font-semibold leading-5 text-[#414651] hover:bg-[#F5F5F6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
                    <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white border border-[#E9EAEB] rounded-xl shadow-[0px_1px_2px_rgba(10,13,18,0.05)] p-8 text-center">
            <p className="font-avenir text-sm leading-5 text-[#535862]">
              No billing history available
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
