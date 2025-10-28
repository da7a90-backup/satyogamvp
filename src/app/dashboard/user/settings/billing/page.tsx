'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function BillingSettingsPage() {
  const [subscription, setSubscription] = useState({
    plan: 'Pragyani',
    status: 'Active',
    billing_cycle: 'Monthly',
    amount: 47,
    next_billing_date: '2025-11-25',
    payment_method: '**** **** **** 4242',
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Billing & Subscription</h2>
        <p className="mt-1 text-sm text-gray-600">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Plan */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h3>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-3">
                <h4 className="text-2xl font-bold text-gray-900">
                  {subscription.plan}
                </h4>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                  {subscription.status}
                </span>
              </div>
              <p className="mt-2 text-gray-600">
                ${subscription.amount}/month • Billed {subscription.billing_cycle}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Next billing date: {new Date(subscription.next_billing_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="space-y-2">
              <Button variant="outline" size="sm">
                Change Plan
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                Cancel Subscription
              </Button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-blue-200">
            <h5 className="font-semibold text-gray-900 mb-2">Plan Includes:</h5>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Unlimited access to all teachings
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Priority retreat registration
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Exclusive monthly Q&A sessions
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Community forum access
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
        <div className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center text-xs font-bold">
              VISA
            </div>
            <div>
              <p className="font-medium text-gray-900">{subscription.payment_method}</p>
              <p className="text-sm text-gray-500">Expires 12/2027</p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            Update
          </Button>
        </div>
      </div>

      {/* Billing History */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing History</h3>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Oct 25, 2025
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  Pragyani Monthly Subscription
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  $47.00
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Paid
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <Button variant="ghost" size="sm">
                    Download
                  </Button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Sep 25, 2025
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  Pragyani Monthly Subscription
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  $47.00
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Paid
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <Button variant="ghost" size="sm">
                    Download
                  </Button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Aug 25, 2025
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  Pragyani Monthly Subscription
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  $47.00
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Paid
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <Button variant="ghost" size="sm">
                    Download
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
