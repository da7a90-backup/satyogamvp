'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Search, Play, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RetreatData {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  hero_image_url?: string;
  start_date?: string;
  end_date?: string;
  portal_sessions?: any[];
  portal_schedule?: any[];
  preparation_instructions?: string;
  about_retreat?: string;
  announcement?: string;
  invitation_message?: string;
}

interface RetreatOverviewClientProps {
  retreat: RetreatData;
}

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'classes', label: 'Classes' },
  { id: 'forum', label: 'Forum' },
  { id: 'preparing', label: 'Preparing for the retreat' },
];

const weekDays = [
  { id: 'mon', label: 'Mon', date: '12' },
  { id: 'tue', label: 'Tue', date: '13' },
  { id: 'wed', label: 'Wed', date: '14' },
  { id: 'thu', label: 'Thu', date: '15' },
  { id: 'fri', label: 'Fri', date: '16' },
];

const faqItems = [
  {
    question: 'What should I bring to the retreat?',
    answer: 'Please bring comfortable clothing suitable for meditation and yoga practice, any personal items you need, and an open mind ready for transformation.',
  },
  {
    question: 'What is the daily schedule?',
    answer: 'Each day includes morning meditation, teachings, group discussions, and evening reflection periods. Detailed schedules are provided in the Classes section.',
  },
  {
    question: 'Can I join sessions remotely?',
    answer: 'Yes, all sessions are available for remote participation through our online portal. You will receive access links upon registration.',
  },
  {
    question: 'What if I miss a session?',
    answer: 'All sessions are recorded and available in your portal library. You can watch them at your convenience.',
  },
];

export default function RetreatOverviewClient({ retreat }: RetreatOverviewClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [activeDay, setActiveDay] = useState('mon');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleBack = () => {
    router.back();
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F1]">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-[398px] sm:max-w-full mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-[#717680] hover:text-[#181D27] transition-colors font-avenir"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-base">Back</span>
            </button>
            <button className="text-[#717680] hover:text-[#181D27] transition-colors">
              <Search className="w-5 h-5" />
            </button>
          </div>

          <h1 className="font-optima text-2xl font-semibold text-[#181D27] mb-4">
            {retreat.title}
          </h1>

          {/* Tabs Navigation */}
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
            <div className="flex gap-6 border-b border-gray-200 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'pb-3 font-avenir text-sm whitespace-nowrap transition-colors relative',
                    activeTab === tab.id
                      ? 'text-[#7D1A13] font-medium'
                      : 'text-[#717680] hover:text-[#181D27]'
                  )}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7D1A13]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[398px] sm:max-w-4xl lg:max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Hero Section */}
        <div className="relative w-full h-[240px] sm:h-[320px] rounded-2xl overflow-hidden mb-6">
          {retreat.hero_image_url ? (
            <img
              src={retreat.hero_image_url}
              alt={retreat.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#7D1A13] to-[#4A0F0C]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h2 className="font-optima text-2xl sm:text-3xl font-semibold text-white mb-2">
              {retreat.subtitle || 'Begin Your Journey'}
            </h2>
            <p className="font-avenir text-sm text-white/90">
              {retreat.start_date && retreat.end_date
                ? `${new Date(retreat.start_date).toLocaleDateString()} - ${new Date(retreat.end_date).toLocaleDateString()}`
                : 'Ongoing Retreat'}
            </p>
          </div>
        </div>

        {/* Day Filter Buttons */}
        <div className="mb-6">
          <h3 className="font-optima text-lg font-semibold text-[#181D27] mb-3">
            Live Schedule
          </h3>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
            {weekDays.map((day) => (
              <button
                key={day.id}
                onClick={() => setActiveDay(day.id)}
                className={cn(
                  'flex flex-col items-center justify-center min-w-[64px] h-[72px] rounded-xl font-avenir transition-all',
                  activeDay === day.id
                    ? 'bg-[#7D1A13] text-white shadow-lg'
                    : 'bg-white text-[#717680] border border-gray-200 hover:border-[#7D1A13] hover:text-[#7D1A13]'
                )}
              >
                <span className="text-xs font-medium mb-1">{day.label}</span>
                <span className="text-xl font-semibold">{day.date}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Live Schedule Cards */}
        <div className="space-y-4 mb-8">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="relative w-full h-[180px] sm:h-[200px] bg-gray-200">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
                    <Play className="w-6 h-6 text-[#7D1A13] ml-1" fill="currentColor" />
                  </div>
                </div>
                <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full">
                  <span className="font-avenir text-xs text-white font-medium">
                    {item === 1 ? 'Live Now' : `${10 + item}:00 AM PST`}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-optima text-lg font-semibold text-[#181D27]">
                    Morning Meditation Session {item}
                  </h4>
                  <span className="font-avenir text-xs text-[#717680] mt-1">45 min</span>
                </div>
                <p className="font-avenir text-sm text-[#717680] line-clamp-2">
                  Join us for a guided meditation practice to center your mind and open your heart to the day&apos;s teachings.
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Announcement Section */}
        {retreat.announcement && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <h3 className="font-optima text-base font-semibold text-amber-900 mb-2">
              Announcement
            </h3>
            <p className="font-avenir text-sm text-amber-800">
              {retreat.announcement}
            </p>
          </div>
        )}

        {/* Invitation Message */}
        {retreat.invitation_message && (
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
            <h3 className="font-optima text-xl font-semibold text-[#181D27] mb-3">
              Welcome Message
            </h3>
            <p className="font-avenir text-base text-[#717680] leading-relaxed">
              {retreat.invitation_message}
            </p>
          </div>
        )}

        {/* About the Retreat */}
        {retreat.about_retreat && (
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
            <h3 className="font-optima text-xl font-semibold text-[#181D27] mb-3">
              About This Retreat
            </h3>
            <div
              className="font-avenir text-base text-[#717680] leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: retreat.about_retreat }}
            />
          </div>
        )}

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-optima text-xl font-semibold text-[#181D27] mb-4">
            Frequently Asked Questions
          </h3>
          <div className="space-y-3">
            {faqItems.map((faq, index) => (
              <div
                key={index}
                className="border-b border-gray-100 last:border-b-0 pb-3 last:pb-0"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between text-left py-2 hover:text-[#7D1A13] transition-colors"
                >
                  <span className="font-avenir text-sm font-medium text-[#181D27]">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      'w-5 h-5 text-[#717680] transition-transform flex-shrink-0 ml-2',
                      expandedFaq === index && 'rotate-180'
                    )}
                  />
                </button>
                {expandedFaq === index && (
                  <div className="pt-2 pb-1">
                    <p className="font-avenir text-sm text-[#717680] leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
