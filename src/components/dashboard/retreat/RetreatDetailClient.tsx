'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { getRetreatBySlug } from '@/lib/retreats-api';
import { Retreat } from '@/types/retreat';
import OverviewTab from './tabs/OverviewTab';
import ClassesTab from './tabs/ClassesTab';
import ForumTab from './tabs/ForumTab';
import PreparationTab from './tabs/PreparationTab';
import LiveScheduleSidebar from './LiveScheduleSidebar';
import RetreatPaymentModal from './RetreatPaymentModal';

interface RetreatDetailClientProps {
  slug: string;
  isAuthenticated: boolean;
  userJwt: string | null;
}

type TabType = 'overview' | 'classes' | 'forum' | 'preparing';

export default function RetreatDetailClient({
  slug,
  isAuthenticated,
  userJwt,
}: RetreatDetailClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [retreat, setRetreat] = useState<Retreat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !userJwt) {
      router.push('/login');
      return;
    }

    // Store token in localStorage for API calls
    if (typeof window !== 'undefined') {
      localStorage.setItem('fastapi_token', userJwt);
    }

    fetchRetreatData();
  }, [slug, isAuthenticated, userJwt, router]);

  const fetchRetreatData = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getRetreatBySlug(slug);
      setRetreat(data);
    } catch (err: any) {
      console.error('Error fetching retreat:', err);
      setError(err.message || 'Failed to load retreat');
    } finally {
      setLoading(false);
    }
  };

  // Check if retreat has ended
  const isRetreatPast = () => {
    if (!retreat?.end_date) return false;
    return new Date(retreat.end_date) < new Date();
  };

  // Check if access has expired for 12-day users
  const hasAccessExpired = () => {
    if (!retreat?.access_expires_at) return false;
    return new Date(retreat.access_expires_at) < new Date();
  };

  // Calculate days remaining for 12-day access
  const getDaysRemaining = () => {
    if (!retreat?.access_expires_at) return null;
    const expiresAt = new Date(retreat.access_expires_at);
    const now = new Date();
    const diffTime = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Should show forum tab
  const showForumTab = () => {
    if (!retreat?.is_registered) return false;
    // Check if forum is enabled by admin
    if (!retreat?.forum_enabled) return false;
    // Hide forum for past retreats (after 30-day grace period)
    if (isRetreatPast()) {
      const gracePeriodEnd = new Date(retreat.end_date!);
      gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 30);
      if (new Date() > gracePeriodEnd) return false;
    }
    return true;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D1A13]"></div>
      </div>
    );
  }

  if (error || !retreat) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Retreat not found'}</p>
          <Link
            href="/dashboard/user/retreats"
            className="text-[#7D1A13] hover:underline"
          >
            Back to Retreats
          </Link>
        </div>
      </div>
    );
  }

  // Check if user should see content or payment modal
  const shouldShowContent = () => {
    if (!retreat?.is_registered) return false;
    if (retreat.access_type === 'limited_12day' && hasAccessExpired()) return false;
    return retreat.can_access || false;
  };

  return (
    <div className="min-h-full bg-[#FAF8F1] flex flex-col">
      {/* Main Container */}
      <div className="flex flex-col items-start p-8 gap-6 flex-grow">
        {/* Section header with Back Button and Search */}
        <div className="flex flex-col items-start gap-5 self-stretch">
          <div className="flex flex-row items-center justify-between self-stretch">
            {/* Back Button */}
            <Link
              href="/dashboard/user/retreats"
              className="flex flex-row justify-center items-center gap-1.5 text-[#7D1A13] hover:opacity-80 transition-opacity"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-semibold font-avenir">
                Back
              </span>
            </Link>

            {/* Search Bar */}
            <div className="flex flex-col items-start gap-2 w-80 max-w-[320px]">
              <div className="relative w-full">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <svg
                    className="w-5 h-5 text-[#717680]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.67}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search"
                  className="
                    w-full h-10 pl-10 pr-3 py-2
                    bg-white border border-[#D5D7DA] rounded-lg
                    shadow-sm
                    text-base text-[#717680] font-normal font-avenir
                    focus:outline-none focus:border-[#7D1A13] focus:ring-1 focus:ring-[#7D1A13]
                  "
                />
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative h-[304px] self-stretch rounded-xl overflow-hidden">
          {retreat.thumbnail_url ? (
            <Image
              src={retreat.thumbnail_url}
              alt={retreat.title}
              fill
              className="object-cover"
              unoptimized={true}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <div className="flex flex-col items-center gap-6 opacity-30">
                <svg className="w-32 h-32 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="flex gap-4">
                  <svg className="w-16 h-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <svg className="w-16 h-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />

          {/* Hero Content */}
          <div className="absolute bottom-8 left-8 flex flex-col items-start gap-6 max-w-[1056px]">
            <div className="flex flex-col items-start gap-6">
              {retreat.start_date && retreat.end_date && (
                <p className="text-base font-medium text-white font-avenir">
                  {new Date(retreat.start_date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                  })}{' '}
                  -{' '}
                  {new Date(retreat.end_date).toLocaleDateString('en-US', {
                    day: 'numeric',
                  })}
                  , {new Date(retreat.start_date).getFullYear()}
                </p>
              )}
              <h1 className="text-4xl font-semibold leading-[44px] tracking-[-0.02em] text-white font-avenir">
                {retreat.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Horizontal Tabs */}
        {shouldShowContent() && (
          <div className="flex flex-col items-start self-stretch border-b border-[#E9EAEB]">
            <div className="flex flex-row items-start gap-3">
              <button
                onClick={() => setActiveTab('overview')}
                className={`
                  flex flex-row justify-center items-center px-1 pb-3 gap-2 border-b-2 font-semibold text-sm font-avenir
                  ${
                    activeTab === 'overview'
                      ? 'border-[#942017] text-[#7D1A13]'
                      : 'border-transparent text-[#717680]'
                  }
                `}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('classes')}
                className={`
                  flex flex-row justify-center items-center px-1 pb-3 gap-2 border-b-2 font-semibold text-sm font-avenir
                  ${
                    activeTab === 'classes'
                      ? 'border-[#942017] text-[#7D1A13]'
                      : 'border-transparent text-[#717680]'
                  }
                `}
              >
                Classes
              </button>
              {showForumTab() && (
                <button
                  onClick={() => setActiveTab('forum')}
                  className={`
                    flex flex-row justify-center items-center px-1 pb-3 gap-2 border-b-2 font-semibold text-sm font-avenir
                    ${
                      activeTab === 'forum'
                        ? 'border-[#942017] text-[#7D1A13]'
                        : 'border-transparent text-[#717680]'
                    }
                  `}
                >
                  Forum
                </button>
              )}
              {/* Hide "Preparing" tab for past retreats */}
              {!isRetreatPast() && (
                <button
                  onClick={() => setActiveTab('preparing')}
                  className={`
                    flex flex-row justify-center items-center px-1 pb-3 gap-2 border-b-2 font-semibold text-sm font-avenir
                    ${
                      activeTab === 'preparing'
                        ? 'border-[#942017] text-[#7D1A13]'
                        : 'border-transparent text-[#717680]'
                    }
                  `}
                >
                  Preparing for the retreat
                </button>
              )}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex flex-row items-start gap-8 self-stretch flex-grow">
          {/* Left Side - Tabs Content */}
          <div className="flex-1">
            {!shouldShowContent() ? (
              // Show access denied message if user doesn't have access
              <div className="text-center py-16">
                <div className="max-w-lg mx-auto">
                  <svg
                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 font-avenir">
                    {!retreat?.is_registered
                      ? 'Register to Access This Retreat'
                      : 'Access Expired'}
                  </h3>
                  <p className="text-gray-600 mb-6 font-avenir">
                    {!retreat?.is_registered
                      ? 'You need to register for this retreat to access the portal content.'
                      : 'Your 12-day access period has ended. Upgrade to lifetime access to continue.'}
                  </p>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="px-6 py-3 bg-[#7D1A13] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity font-avenir"
                  >
                    {!retreat?.is_registered ? 'Register Now' : 'Upgrade to Lifetime Access'}
                  </button>
                </div>
              </div>
            ) : (
              // Show content if user has access
              <>
                {activeTab === 'overview' && <OverviewTab retreat={retreat} />}
                {activeTab === 'classes' && <ClassesTab retreat={retreat} />}
                {activeTab === 'forum' && <ForumTab retreat={retreat} />}
                {activeTab === 'preparing' && <PreparationTab retreat={retreat} />}
              </>
            )}
          </div>

          {/* Right Side - Live Schedule Sidebar (only in Overview tab) */}
          {shouldShowContent() && activeTab === 'overview' && <LiveScheduleSidebar retreat={retreat} />}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <RetreatPaymentModal
          retreat={retreat}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            setShowPaymentModal(false);
            fetchRetreatData(); // Refresh retreat data
          }}
        />
      )}
    </div>
  );
}
