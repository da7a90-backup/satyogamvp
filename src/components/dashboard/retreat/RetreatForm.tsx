'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';

interface RetreatFormProps {
  retreat?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function RetreatForm({ retreat, onSuccess, onCancel }: RetreatFormProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    subtitle: '',
    description: '',
    type: 'online',
    start_date: '',
    end_date: '',
    price_lifetime: '',
    price_limited: '',
    price_onsite: '',
    location: '',
    max_participants: '',
    is_published: false,
    forum_enabled: false,
    thumbnail_url: '',
    booking_tagline: '',
    duration_days: '',
    has_audio: true,
    has_video: true,
  });

  useEffect(() => {
    if (retreat) {
      setFormData({
        slug: retreat.slug || '',
        title: retreat.title || '',
        subtitle: retreat.subtitle || '',
        description: retreat.description || '',
        type: retreat.type || 'online',
        start_date: retreat.start_date ? retreat.start_date.split('T')[0] : '',
        end_date: retreat.end_date ? retreat.end_date.split('T')[0] : '',
        price_lifetime: retreat.price_lifetime || '',
        price_limited: retreat.price_limited || '',
        price_onsite: retreat.price_onsite || '',
        location: retreat.location || '',
        max_participants: retreat.max_participants || '',
        is_published: retreat.is_published || false,
        forum_enabled: retreat.forum_enabled || false,
        thumbnail_url: retreat.thumbnail_url || '',
        booking_tagline: retreat.booking_tagline || '',
        duration_days: retreat.duration_days || '',
        has_audio: retreat.has_audio ?? true,
        has_video: retreat.has_video ?? true,
      });
    }
  }, [retreat]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setFormData(prev => ({ ...prev, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = session?.user?.accessToken || localStorage.getItem('authToken');

      // Prepare data
      const dataToSend: any = {
        slug: formData.slug,
        title: formData.title,
        type: formData.type,
        is_published: formData.is_published,
        forum_enabled: formData.forum_enabled,
        has_audio: formData.has_audio,
        has_video: formData.has_video,
      };

      // Add optional fields if they have values
      if (formData.subtitle) dataToSend.subtitle = formData.subtitle;
      if (formData.description) dataToSend.description = formData.description;
      if (formData.start_date) dataToSend.start_date = new Date(formData.start_date).toISOString();
      if (formData.end_date) dataToSend.end_date = new Date(formData.end_date).toISOString();
      if (formData.price_lifetime) dataToSend.price_lifetime = parseFloat(formData.price_lifetime);
      if (formData.price_limited) dataToSend.price_limited = parseFloat(formData.price_limited);
      if (formData.price_onsite) dataToSend.price_onsite = parseFloat(formData.price_onsite);
      if (formData.location) dataToSend.location = formData.location;
      if (formData.max_participants) dataToSend.max_participants = parseInt(formData.max_participants);
      if (formData.thumbnail_url) dataToSend.thumbnail_url = formData.thumbnail_url;
      if (formData.booking_tagline) dataToSend.booking_tagline = formData.booking_tagline;
      if (formData.duration_days) dataToSend.duration_days = parseInt(formData.duration_days);

      const url = retreat
        ? `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/admin/retreats/${retreat.id}`
        : `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/admin/retreats`;

      const method = retreat ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to save retreat');
      }
    } catch (error) {
      console.error('Failed to save retreat:', error);
      alert('Failed to save retreat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-[#000000]" style={{ fontFamily: 'Optima, serif' }}>
            {retreat ? 'Edit Retreat' : 'Create Retreat'}
          </h1>
          <p className="text-[#717680] mt-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            {retreat ? 'Update retreat details and settings' : 'Create a new retreat or past retreat for store'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-8 space-y-6">
        {/* Basic Info */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[#000000]" style={{ fontFamily: 'Optima, serif' }}>
            Basic Information
          </h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                onBlur={generateSlug}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Slug *
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#000000] mb-2">
              Subtitle
            </label>
            <input
              type="text"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#000000] mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
              >
                <option value="online">Online</option>
                <option value="onsite_darshan">Onsite - Darshan</option>
                <option value="onsite_shakti">Onsite - Shakti</option>
                <option value="onsite_sevadhari">Onsite - Sevadhari</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Duration (days)
              </label>
              <input
                type="number"
                name="duration_days"
                value={formData.duration_days}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Dates & Location */}
        <div className="space-y-6 border-t pt-6">
          <h2 className="text-xl font-bold text-[#000000]" style={{ fontFamily: 'Optima, serif' }}>
            Dates & Location
          </h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                End Date
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Costa Rica"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Max Participants
              </label>
              <input
                type="number"
                name="max_participants"
                value={formData.max_participants}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-6 border-t pt-6">
          <h2 className="text-xl font-bold text-[#000000]" style={{ fontFamily: 'Optima, serif' }}>
            Pricing
          </h2>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Lifetime Access Price
              </label>
              <input
                type="number"
                name="price_lifetime"
                value={formData.price_lifetime}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Limited Access Price (12 days)
              </label>
              <input
                type="number"
                name="price_limited"
                value={formData.price_limited}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Onsite Price
              </label>
              <input
                type="number"
                name="price_onsite"
                value={formData.price_onsite}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Media & Display */}
        <div className="space-y-6 border-t pt-6">
          <h2 className="text-xl font-bold text-[#000000]" style={{ fontFamily: 'Optima, serif' }}>
            Media & Display
          </h2>

          <div>
            <label className="block text-sm font-medium text-[#000000] mb-2">
              Thumbnail URL
            </label>
            <input
              type="url"
              name="thumbnail_url"
              value={formData.thumbnail_url}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#000000] mb-2">
              Booking Tagline
            </label>
            <input
              type="text"
              name="booking_tagline"
              value={formData.booking_tagline}
              onChange={handleChange}
              placeholder="Short tagline for the retreat card"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
            />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="has_audio"
                checked={formData.has_audio}
                onChange={handleChange}
                className="w-4 h-4 text-[#7D1A13] border-gray-300 rounded focus:ring-[#7D1A13]"
              />
              <span className="text-sm font-medium text-[#000000]">Has Audio Content</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="has_video"
                checked={formData.has_video}
                onChange={handleChange}
                className="w-4 h-4 text-[#7D1A13] border-gray-300 rounded focus:ring-[#7D1A13]"
              />
              <span className="text-sm font-medium text-[#000000]">Has Video Content</span>
            </label>
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-6 border-t pt-6">
          <h2 className="text-xl font-bold text-[#000000]" style={{ fontFamily: 'Optima, serif' }}>
            Settings
          </h2>

          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_published"
                checked={formData.is_published}
                onChange={handleChange}
                className="w-4 h-4 text-[#7D1A13] border-gray-300 rounded focus:ring-[#7D1A13]"
              />
              <div>
                <span className="text-sm font-medium text-[#000000]">Published</span>
                <p className="text-xs text-[#717680]">
                  When unchecked, retreat will only be accessible via linked products (past retreats)
                </p>
              </div>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="forum_enabled"
                checked={formData.forum_enabled}
                onChange={handleChange}
                className="w-4 h-4 text-[#7D1A13] border-gray-300 rounded focus:ring-[#7D1A13]"
              />
              <div>
                <span className="text-sm font-medium text-[#000000]">Enable Forum</span>
                <p className="text-xs text-[#717680]">
                  Allow registered users to post in retreat forum
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 border-t pt-6">
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-[#7D1A13] hover:bg-[#7D1A13]/90 text-white"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                {retreat ? 'Update Retreat' : 'Create Retreat'}
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
