'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Upload } from 'lucide-react';

export default function ProfileSettingsPage() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    country: '',
    timezone: '',
    bio: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch user profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.accessToken) {
        setIsFetching(false);
        return;
      }

      try {
        const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
        const response = await fetch(`${FASTAPI_URL}/api/users/profile`, {
          headers: {
            'Authorization': `Bearer ${session.user.accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const nameParts = (data.name || '').split(' ');
          setFormData({
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            email: data.email || '',
            role: data.profile?.role || '',
            country: data.profile?.country || data.profile?.address || '',
            timezone: data.profile?.preferences?.timezone || '',
            bio: data.profile?.bio || '',
          });
        } else {
          console.error('Failed to fetch profile:', await response.text());
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfile();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.accessToken) {
      setMessage({
        type: 'error',
        text: 'You must be logged in to update your profile.',
      });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const response = await fetch(`${FASTAPI_URL}/api/users/profile?name=${encodeURIComponent(fullName)}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Profile updated successfully!',
        });
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        setMessage({
          type: 'error',
          text: errorData.detail || 'Failed to update profile. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({
        type: 'error',
        text: 'Failed to update profile. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D1A13]"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h2 className="font-avenir text-lg font-semibold leading-7 text-[#181D27]">
          Personal info
        </h2>
        <p className="mt-0.5 font-avenir text-sm leading-5 text-[#535862]">
          Update your photo and personal details here.
        </p>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-xl border ${
          message.type === 'success'
            ? 'bg-[#ECFDF3] text-[#067647] border-[#ABEFC6]'
            : 'bg-[#FEE] text-[#B42318] border-[#FDA29B]'
        }`}>
          <p className="font-avenir text-sm">{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Name Fields */}
        <div className="flex flex-col gap-5 py-5 border-b border-[#E9EAEB]">
          <label className="font-avenir text-sm font-medium leading-5 text-[#414651]">
            Name*
          </label>
          <div className="flex flex-col sm:flex-row gap-8">
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Olivia"
              className="flex-1 h-11 px-[13px] py-2.5 bg-white border border-[#D5D7DA] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05),inset_0px_0px_0px_1px_rgba(10,13,18,0.18),inset_0px_-2px_0px_rgba(10,13,18,0.05)] font-avenir text-base leading-6 text-[#181D27] placeholder:text-[#A4A7AE] focus:outline-none focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent transition-all"
            />
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Rhye"
              className="flex-1 h-11 px-[13px] py-2.5 bg-white border border-[#D5D7DA] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05),inset_0px_0px_0px_1px_rgba(10,13,18,0.18),inset_0px_-2px_0px_rgba(10,13,18,0.05)] font-avenir text-base leading-6 text-[#181D27] placeholder:text-[#A4A7AE] focus:outline-none focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Email Address */}
        <div className="flex flex-col gap-5 py-5 border-b border-[#E9EAEB]">
          <label className="font-avenir text-sm font-medium leading-5 text-[#414651]">
            Email address*
          </label>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#535862]" viewBox="0 0 20 20" fill="none">
              <path d="M2.5 6.667L9.077 11.072c.575.363 1.271.363 1.846 0L17.5 6.667M4.167 15.833h11.666c.92 0 1.667-.746 1.667-1.666V5.833c0-.92-.746-1.666-1.667-1.666H4.167c-.92 0-1.667.746-1.667 1.666v8.334c0 .92.746 1.666 1.667 1.666z" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="olivia@untitledui.com"
              disabled
              className="flex-1 h-11 px-[13px] py-2.5 bg-[#F5F5F6] border border-[#E9EAEB] rounded-lg font-avenir text-base leading-6 text-[#535862] cursor-not-allowed"
            />
          </div>
        </div>

        {/* Your photo */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-5 py-5 border-b border-[#E9EAEB]">
          <label className="font-avenir text-sm font-medium leading-5 text-[#414651] sm:min-w-[280px]">
            Your photo<br />
            <span className="font-normal text-[#535862]">This will be displayed on your profile.</span>
          </label>
          <div className="flex flex-col sm:flex-row items-start gap-5 flex-1">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-[#F5F5F6] flex items-center justify-center flex-shrink-0">
              <span className="font-avenir text-xl text-[#535862]">👤</span>
            </div>
            {/* Upload Area */}
            <div className="flex-1 w-full sm:max-w-[512px] h-40 border-2 border-dashed border-[#E9EAEB] rounded-xl bg-white flex flex-col items-center justify-center gap-3 p-4 hover:border-[#D5D7DA] transition-colors cursor-pointer">
              <div className="w-10 h-10 bg-white border border-[#E9EAEB] rounded-lg shadow-[0px_1px_2px_rgba(10,13,18,0.05)] flex items-center justify-center">
                <Upload className="w-5 h-5 text-[#535862]" />
              </div>
              <div className="text-center">
                <p className="font-avenir text-sm leading-5">
                  <span className="font-semibold text-[#7D1A13]">Click to upload</span>
                  <span className="text-[#535862]"> or drag and drop</span>
                </p>
                <p className="font-avenir text-xs leading-[18px] text-[#535862]">
                  SVG, PNG, JPG or GIF (max. 800x400px)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Role */}
        <div className="flex flex-col gap-5 py-5 border-b border-[#E9EAEB]">
          <label className="font-avenir text-sm font-medium leading-5 text-[#414651]">
            Role
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="h-11 px-[13px] py-2.5 bg-white border border-[#D5D7DA] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05),inset_0px_0px_0px_1px_rgba(10,13,18,0.18),inset_0px_-2px_0px_rgba(10,13,18,0.05)] font-avenir text-base leading-6 text-[#181D27] focus:outline-none focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent transition-all"
          >
            <option value="">Select...</option>
            <option value="Product Designer">Product Designer</option>
            <option value="Developer">Developer</option>
            <option value="Manager">Manager</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Country */}
        <div className="flex flex-col gap-5 py-5 border-b border-[#E9EAEB]">
          <label className="font-avenir text-sm font-medium leading-5 text-[#414651]">
            Country
          </label>
          <select
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="h-11 px-[13px] py-2.5 bg-white border border-[#D5D7DA] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05),inset_0px_0px_0px_1px_rgba(10,13,18,0.18),inset_0px_-2px_0px_rgba(10,13,18,0.05)] font-avenir text-base leading-6 text-[#181D27] focus:outline-none focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent transition-all"
          >
            <option value="">Select...</option>
            <option value="Australia">🇦🇺 Australia</option>
            <option value="United States">🇺🇸 United States</option>
            <option value="United Kingdom">🇬🇧 United Kingdom</option>
            <option value="Canada">🇨🇦 Canada</option>
            <option value="Germany">🇩🇪 Germany</option>
            <option value="France">🇫🇷 France</option>
          </select>
        </div>

        {/* Timezone */}
        <div className="flex flex-col gap-5 py-5 border-b border-[#E9EAEB]">
          <label className="font-avenir text-sm font-medium leading-5 text-[#414651]">
            Timezone<br />
            <span className="font-normal text-[#535862]"></span>
          </label>
          <select
            name="timezone"
            value={formData.timezone}
            onChange={handleChange}
            className="h-11 px-[13px] py-2.5 bg-white border border-[#D5D7DA] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05),inset_0px_0px_0px_1px_rgba(10,13,18,0.18),inset_0px_-2px_0px_rgba(10,13,18,0.05)] font-avenir text-base leading-6 text-[#181D27] focus:outline-none focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent transition-all"
          >
            <option value="">Select...</option>
            <option value="Pacific/Midway">🕐 Pacific Standard Time (PST) UTC-08:00</option>
            <option value="America/New_York">🕐 Eastern Time (ET) UTC-05:00</option>
            <option value="America/Chicago">🕐 Central Time (CT) UTC-06:00</option>
            <option value="America/Denver">🕐 Mountain Time (MT) UTC-07:00</option>
            <option value="America/Los_Angeles">🕐 Pacific Time (PT) UTC-08:00</option>
            <option value="Europe/London">🕐 London (GMT) UTC+00:00</option>
            <option value="Europe/Paris">🕐 Paris (CET) UTC+01:00</option>
            <option value="Asia/Tokyo">🕐 Tokyo (JST) UTC+09:00</option>
          </select>
        </div>

        {/* Bio */}
        <div className="flex flex-col gap-5 py-5 border-b border-[#E9EAEB]">
          <label className="font-avenir text-sm font-medium leading-5 text-[#414651]">
            Bio*<br />
            <span className="font-normal text-[#535862]">Write a short introduction.</span>
          </label>
          <div className="relative">
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={5}
              maxLength={500}
              placeholder="I'm a Product Designer based in Melbourne, Australia. I specialise in UX/UI design, brand strategy, and Webflow development."
              className="w-full px-[13px] py-3 bg-white border border-[#D5D7DA] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05),inset_0px_0px_0px_1px_rgba(10,13,18,0.18),inset_0px_-2px_0px_rgba(10,13,18,0.05)] font-avenir text-base leading-6 text-[#181D27] placeholder:text-[#A4A7AE] focus:outline-none focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent transition-all resize-none"
            />
            <p className="absolute bottom-3 right-3 font-avenir text-sm leading-5 text-[#535862]">
              {formData.bio.length}/500 characters left
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-8">
          <button
            type="button"
            disabled={isLoading}
            className="px-[14px] py-2.5 bg-white border border-[#D5D7DA] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05),inset_0px_0px_0px_1px_rgba(10,13,18,0.18),inset_0px_-2px_0px_rgba(10,13,18,0.05)] font-avenir text-sm font-semibold leading-5 text-[#414651] hover:bg-[#F5F5F6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-[14px] py-2.5 bg-[#7D1A13] text-white border border-[#7D1A13] rounded-lg shadow-[0px_1px_2px_rgba(16,24,40,0.05),inset_0px_0px_0px_1px_rgba(125,26,19,0.18),inset_0px_-2px_0px_rgba(10,13,18,0.05)] font-avenir text-sm font-semibold leading-5 hover:bg-[#942017] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
