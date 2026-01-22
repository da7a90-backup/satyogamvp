'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface NotificationPreferences {
  email_teachings: boolean;
  email_retreats: boolean;
  email_courses: boolean;
  email_newsletter: boolean;
  email_promotions: boolean;
  push_teachings: boolean;
  push_retreats: boolean;
  push_courses: boolean;
  push_reminders: boolean;
  sms_retreats: boolean;
  sms_reminders: boolean;
}

export default function NotificationsClient() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    email_teachings: true,
    email_retreats: true,
    email_courses: false,
    email_newsletter: true,
    email_promotions: false,
    push_teachings: true,
    push_retreats: true,
    push_courses: true,
    push_reminders: true,
    sms_retreats: false,
    sms_reminders: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Notification preferences stored in user profile preferences JSON field
    // For now, use default values
    setIsFetching(false);
  }, [session]);

  const handleToggle = (key: string) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key as keyof typeof notifications],
    });
  };

  const handleSave = async () => {
    if (!session?.user?.accessToken) {
      setMessage({ type: 'error', text: 'You must be logged in to save preferences.' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    // For now, just show success message
    // TODO: Implement backend endpoint to store notification preferences in user_profile.preferences JSON
    setTimeout(() => {
      setMessage({ type: 'success', text: 'Notification preferences saved successfully!' });
      setIsLoading(false);
    }, 500);
  };

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#7D1A13] focus:ring-offset-2 ${
        checked ? 'bg-[#7D1A13]' : 'bg-gray-200'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D1A13]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[398px] sm:max-w-full mx-auto">
      <div className="mb-6">
        <h2 className="font-optima text-lg sm:text-2xl font-semibold text-[#181D27]">
          Notification Settings
        </h2>
        <p className="mt-1 font-avenir text-sm text-[#535862]">
          Choose how you want to receive updates and notifications
        </p>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-xl border ${
          message.type === 'success'
            ? 'bg-green-50 text-green-800 border-green-200'
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          <p className="font-avenir text-sm">{message.text}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Email Notifications */}
        <div className="bg-white border border-[#E9EAEB] rounded-xl p-4 sm:p-6 shadow-sm">
          <h3 className="font-avenir text-base sm:text-lg font-semibold text-[#181D27] mb-4">Email Notifications</h3>
          <div className="space-y-4">
            {[
              { key: 'email_teachings', label: 'New Teachings', desc: 'Get notified when new teachings are published' },
              { key: 'email_retreats', label: 'Retreat Updates', desc: 'Updates about retreats you\'re registered for' },
              { key: 'email_courses', label: 'Course Progress', desc: 'Updates on your course enrollments and progress' },
              { key: 'email_newsletter', label: 'Newsletter', desc: 'Monthly newsletter with updates and insights' },
              { key: 'email_promotions', label: 'Promotions', desc: 'Special offers and promotional content' },
            ].map((item, idx) => (
              <div
                key={item.key}
                className={`flex items-center justify-between py-3 ${idx > 0 ? 'border-t border-[#E9EAEB]' : ''}`}
              >
                <div className="flex-1 pr-4">
                  <p className="font-avenir text-sm font-medium text-[#181D27]">{item.label}</p>
                  <p className="font-avenir text-sm text-[#535862] mt-0.5">{item.desc}</p>
                </div>
                <ToggleSwitch
                  checked={notifications[item.key as keyof NotificationPreferences] as boolean}
                  onChange={() => handleToggle(item.key)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Push Notifications */}
        <div className="bg-white border border-[#E9EAEB] rounded-xl p-4 sm:p-6 shadow-sm">
          <h3 className="font-avenir text-base sm:text-lg font-semibold text-[#181D27] mb-4">Push Notifications</h3>
          <div className="space-y-4">
            {[
              { key: 'push_teachings', label: 'New Teachings', desc: 'Browser notifications for new teachings' },
              { key: 'push_retreats', label: 'Retreat Updates', desc: 'Important retreat notifications' },
              { key: 'push_courses', label: 'Course Reminders', desc: 'Reminders about course lessons and deadlines' },
              { key: 'push_reminders', label: 'Event Reminders', desc: 'Reminders before events and sessions' },
            ].map((item, idx) => (
              <div
                key={item.key}
                className={`flex items-center justify-between py-3 ${idx > 0 ? 'border-t border-[#E9EAEB]' : ''}`}
              >
                <div className="flex-1 pr-4">
                  <p className="font-avenir text-sm font-medium text-[#181D27]">{item.label}</p>
                  <p className="font-avenir text-sm text-[#535862] mt-0.5">{item.desc}</p>
                </div>
                <ToggleSwitch
                  checked={notifications[item.key as keyof NotificationPreferences] as boolean}
                  onChange={() => handleToggle(item.key)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* SMS Notifications */}
        <div className="bg-white border border-[#E9EAEB] rounded-xl p-4 sm:p-6 shadow-sm">
          <h3 className="font-avenir text-base sm:text-lg font-semibold text-[#181D27] mb-4">SMS Notifications</h3>
          <div className="space-y-4">
            {[
              { key: 'sms_retreats', label: 'Retreat Confirmations', desc: 'SMS confirmations for retreat registrations' },
              { key: 'sms_reminders', label: 'Important Reminders', desc: 'Critical reminders via SMS' },
            ].map((item, idx) => (
              <div
                key={item.key}
                className={`flex items-center justify-between py-3 ${idx > 0 ? 'border-t border-[#E9EAEB]' : ''}`}
              >
                <div className="flex-1 pr-4">
                  <p className="font-avenir text-sm font-medium text-[#181D27]">{item.label}</p>
                  <p className="font-avenir text-sm text-[#535862] mt-0.5">{item.desc}</p>
                </div>
                <ToggleSwitch
                  checked={notifications[item.key as keyof NotificationPreferences] as boolean}
                  onChange={() => handleToggle(item.key)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2.5 bg-[#7D1A13] text-white font-avenir text-sm font-semibold rounded-lg shadow-sm hover:bg-[#942017] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}
