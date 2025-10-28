'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function NotificationsSettingsPage() {
  const [notifications, setNotifications] = useState({
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
  const [message, setMessage] = useState('');

  const handleToggle = (key: string) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key as keyof typeof notifications],
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      // TODO: Implement API call to save notification preferences
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMessage('Notification preferences saved successfully!');
    } catch (error) {
      setMessage('Failed to save preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        checked ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Notification Settings</h2>
        <p className="mt-1 text-sm text-gray-600">
          Choose how you want to receive updates and notifications
        </p>
      </div>

      {message && (
        <div className="mb-6 p-4 rounded-lg bg-green-50 text-green-800 border border-green-200">
          {message}
        </div>
      )}

      <div className="space-y-8">
        {/* Email Notifications */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">New Teachings</p>
                <p className="text-sm text-gray-500">
                  Get notified when new teachings are published
                </p>
              </div>
              <ToggleSwitch
                checked={notifications.email_teachings}
                onChange={() => handleToggle('email_teachings')}
              />
            </div>

            <div className="flex items-center justify-between py-3 border-t border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Retreat Updates</p>
                <p className="text-sm text-gray-500">
                  Updates about retreats you're registered for
                </p>
              </div>
              <ToggleSwitch
                checked={notifications.email_retreats}
                onChange={() => handleToggle('email_retreats')}
              />
            </div>

            <div className="flex items-center justify-between py-3 border-t border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Course Progress</p>
                <p className="text-sm text-gray-500">
                  Updates on your course enrollments and progress
                </p>
              </div>
              <ToggleSwitch
                checked={notifications.email_courses}
                onChange={() => handleToggle('email_courses')}
              />
            </div>

            <div className="flex items-center justify-between py-3 border-t border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Newsletter</p>
                <p className="text-sm text-gray-500">
                  Monthly newsletter with updates and insights
                </p>
              </div>
              <ToggleSwitch
                checked={notifications.email_newsletter}
                onChange={() => handleToggle('email_newsletter')}
              />
            </div>

            <div className="flex items-center justify-between py-3 border-t border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Promotions</p>
                <p className="text-sm text-gray-500">
                  Special offers and promotional content
                </p>
              </div>
              <ToggleSwitch
                checked={notifications.email_promotions}
                onChange={() => handleToggle('email_promotions')}
              />
            </div>
          </div>
        </div>

        {/* Push Notifications */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Push Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">New Teachings</p>
                <p className="text-sm text-gray-500">
                  Browser notifications for new teachings
                </p>
              </div>
              <ToggleSwitch
                checked={notifications.push_teachings}
                onChange={() => handleToggle('push_teachings')}
              />
            </div>

            <div className="flex items-center justify-between py-3 border-t border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Retreat Updates</p>
                <p className="text-sm text-gray-500">
                  Important retreat notifications
                </p>
              </div>
              <ToggleSwitch
                checked={notifications.push_retreats}
                onChange={() => handleToggle('push_retreats')}
              />
            </div>

            <div className="flex items-center justify-between py-3 border-t border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Course Reminders</p>
                <p className="text-sm text-gray-500">
                  Reminders about course lessons and deadlines
                </p>
              </div>
              <ToggleSwitch
                checked={notifications.push_courses}
                onChange={() => handleToggle('push_courses')}
              />
            </div>

            <div className="flex items-center justify-between py-3 border-t border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Event Reminders</p>
                <p className="text-sm text-gray-500">
                  Reminders before events and sessions
                </p>
              </div>
              <ToggleSwitch
                checked={notifications.push_reminders}
                onChange={() => handleToggle('push_reminders')}
              />
            </div>
          </div>
        </div>

        {/* SMS Notifications */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">SMS Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Retreat Confirmations</p>
                <p className="text-sm text-gray-500">
                  SMS confirmations for retreat registrations
                </p>
              </div>
              <ToggleSwitch
                checked={notifications.sms_retreats}
                onChange={() => handleToggle('sms_retreats')}
              />
            </div>

            <div className="flex items-center justify-between py-3 border-t border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Important Reminders</p>
                <p className="text-sm text-gray-500">
                  Critical reminders via SMS
                </p>
              </div>
              <ToggleSwitch
                checked={notifications.sms_reminders}
                onChange={() => handleToggle('sms_reminders')}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>
    </div>
  );
}
