"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  DocumentTextIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowUpTrayIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

type ContentType = 'video' | 'videoandaudio' | 'audio' | 'text';
type AccessLevel = 'free' | 'preview' | 'gyani' | 'pragyani' | 'pragyani_plus';

interface Teaching {
  id: string;
  slug: string;
  title: string;
  description?: string;
  content_type: ContentType;
  access_level: AccessLevel;
  preview_duration?: number;
  dash_preview_duration?: number;
  video_url?: string;
  audio_url?: string;
  cloudflare_ids: string[];
  podbean_ids: string[];
  youtube_ids: string[];
  text_content?: string;
  thumbnail_url?: string;
  duration?: number;
  published_date?: string;
  category?: string;
  tags: string[];
  topic?: string;
  filter_tags: string[];
  hidden_tag?: string;
  featured?: string;
  of_the_month?: string;
  pinned?: string;
  view_count: number;
  created_at: string;
  updated_at: string;
}

type TeachingFormData = Omit<Teaching, 'id' | 'view_count' | 'created_at' | 'updated_at'>;

const defaultFormData: TeachingFormData = {
  slug: '',
  title: '',
  description: '',
  content_type: 'video',
  access_level: 'free',
  preview_duration: undefined,
  dash_preview_duration: undefined,
  video_url: '',
  audio_url: '',
  cloudflare_ids: [],
  podbean_ids: [],
  youtube_ids: [],
  text_content: '',
  thumbnail_url: '',
  duration: undefined,
  published_date: '',
  category: '',
  tags: [],
  topic: '',
  filter_tags: [],
  hidden_tag: '',
  featured: '',
  of_the_month: '',
  pinned: '',
};

export default function TeachingsManagementClient() {
  const { data: session } = useSession();
  const [teachings, setTeachings] = useState<Teaching[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTeaching, setEditingTeaching] = useState<Teaching | null>(null);
  const [accessLevelFilter, setAccessLevelFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<TeachingFormData>(defaultFormData);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Tag inputs
  const [tagInput, setTagInput] = useState('');
  const [filterTagInput, setFilterTagInput] = useState('');
  const [cloudflareIdInput, setCloudflareIdInput] = useState('');
  const [podbeanIdInput, setPodbeanIdInput] = useState('');
  const [youtubeIdInput, setYoutubeIdInput] = useState('');

  // Upload states
  const [videoUploading, setVideoUploading] = useState(false);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

  useEffect(() => {
    fetchTeachings();
    setCurrentPage(1); // Reset to first page when filters change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessLevelFilter, categoryFilter]);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchTeachings = async () => {
    try {
      // Check if user is authenticated with a valid token
      if (!session?.user?.accessToken) {
        console.error('No access token available');
        alert('You must be logged in as an admin to access teachings management');
        setLoading(false);
        return;
      }

      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      let url = `${FASTAPI_URL}/api/teachings/admin/teachings?limit=1000`;

      if (accessLevelFilter !== 'all') {
        url += `&access_level=${accessLevelFilter}`;
      }

      if (categoryFilter !== 'all') {
        url += `&category=${categoryFilter}`;
      }

      console.log('Fetching teachings from:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched teachings count:', data.length);
        setTeachings(data);
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        alert(`Failed to fetch teachings: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fetching teachings:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5GB max)
    const maxSize = 5 * 1024 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File is too large. Maximum size is 5GB.');
      return;
    }

    setVideoUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (formData) {
        formData.append('title', formData.title || file.name);
      }

      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const response = await fetch(`${FASTAPI_URL}/api/teachings/admin/teachings/upload-video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Upload failed');
      }

      const result = await response.json();

      // Add the stream_uid to cloudflare_ids array
      setFormData(prev => ({
        ...prev,
        cloudflare_ids: [...prev.cloudflare_ids, result.stream_uid],
        duration: result.duration || prev.duration,
      }));

      alert('Video uploaded successfully!');
    } catch (error) {
      console.error('Video upload error:', error);
      alert(`Failed to upload video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setVideoUploading(false);
      setUploadProgress(0);
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File is too large. Maximum size is 10MB.');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setThumbnailUploading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('alt_text', formData.title || 'Teaching thumbnail');

      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const response = await fetch(`${FASTAPI_URL}/api/teachings/admin/teachings/upload-thumbnail`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
        body: uploadFormData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Upload failed');
      }

      const result = await response.json();

      // Update thumbnail_url with the Cloudflare Images URL
      setFormData(prev => ({
        ...prev,
        thumbnail_url: result.url,
      }));

      alert('Thumbnail uploaded successfully!');
    } catch (error) {
      console.error('Thumbnail upload error:', error);
      alert(`Failed to upload thumbnail: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setThumbnailPreview('');
    } finally {
      setThumbnailUploading(false);
    }
  };

  const openCreateModal = () => {
    setEditingTeaching(null);
    setFormData(defaultFormData);
    setTagInput('');
    setFilterTagInput('');
    setCloudflareIdInput('');
    setPodbeanIdInput('');
    setYoutubeIdInput('');
    setThumbnailPreview('');
    setShowModal(true);
  };

  const openEditModal = (teaching: Teaching) => {
    setEditingTeaching(teaching);
    setFormData({
      slug: teaching.slug,
      title: teaching.title,
      description: teaching.description || '',
      content_type: teaching.content_type,
      access_level: teaching.access_level,
      preview_duration: teaching.preview_duration,
      dash_preview_duration: teaching.dash_preview_duration,
      video_url: teaching.video_url || '',
      audio_url: teaching.audio_url || '',
      cloudflare_ids: teaching.cloudflare_ids || [],
      podbean_ids: teaching.podbean_ids || [],
      youtube_ids: teaching.youtube_ids || [],
      text_content: teaching.text_content || '',
      thumbnail_url: teaching.thumbnail_url || '',
      duration: teaching.duration,
      published_date: teaching.published_date || '',
      category: teaching.category || '',
      tags: teaching.tags || [],
      topic: teaching.topic || '',
      filter_tags: teaching.filter_tags || [],
      hidden_tag: teaching.hidden_tag || '',
      featured: teaching.featured || '',
      of_the_month: teaching.of_the_month || '',
      pinned: teaching.pinned || '',
    });
    setThumbnailPreview(teaching.thumbnail_url || '');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.accessToken) {
      alert('You must be logged in to save teachings');
      return;
    }

    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const url = editingTeaching
        ? `${FASTAPI_URL}/api/teachings/admin/teachings/${editingTeaching.id}`
        : `${FASTAPI_URL}/api/teachings/admin/teachings`;

      const response = await fetch(url, {
        method: editingTeaching ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        fetchTeachings();
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail || 'Failed to save teaching'}`);
      }
    } catch (error) {
      console.error('Error saving teaching:', error);
      alert('Error saving teaching');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this teaching?')) return;

    if (!session?.user?.accessToken) {
      alert('You must be logged in to delete teachings');
      return;
    }

    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
      const response = await fetch(`${FASTAPI_URL}/api/teachings/admin/teachings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
      });

      if (response.ok) {
        fetchTeachings();
      }
    } catch (error) {
      console.error('Error deleting teaching:', error);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const addTag = (type: 'tags' | 'filter_tags' | 'cloudflare_ids' | 'podbean_ids' | 'youtube_ids') => {
    const inputMap = {
      tags: tagInput,
      filter_tags: filterTagInput,
      cloudflare_ids: cloudflareIdInput,
      podbean_ids: podbeanIdInput,
      youtube_ids: youtubeIdInput,
    };

    const setInputMap = {
      tags: setTagInput,
      filter_tags: setFilterTagInput,
      cloudflare_ids: setCloudflareIdInput,
      podbean_ids: setPodbeanIdInput,
      youtube_ids: setYoutubeIdInput,
    };

    const value = inputMap[type].trim();
    if (value && !formData[type].includes(value)) {
      setFormData({
        ...formData,
        [type]: [...formData[type], value],
      });
      setInputMap[type]('');
    }
  };

  const removeTag = (type: 'tags' | 'filter_tags' | 'cloudflare_ids' | 'podbean_ids' | 'youtube_ids', index: number) => {
    setFormData({
      ...formData,
      [type]: formData[type].filter((_, i) => i !== index),
    });
  };

  const filteredTeachings = teachings.filter(teaching =>
    teaching.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (teaching.description && teaching.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (teaching.category && teaching.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredTeachings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTeachings = filteredTeachings.slice(startIndex, startIndex + itemsPerPage);

  const getContentTypeIcon = (contentType: ContentType) => {
    switch (contentType) {
      case 'video':
      case 'videoandaudio':
        return <VideoCameraIcon className="w-5 h-5" />;
      case 'audio':
        return <MusicalNoteIcon className="w-5 h-5" />;
      case 'text':
        return <DocumentTextIcon className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D1A13]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teachings Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage video teachings, audios, meditations, and essays
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-[#7D1A13] hover:bg-[#9d2419] text-white px-4 py-2 rounded-lg font-medium transition"
        >
          <PlusIcon className="w-5 h-5" />
          Create Teaching
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-5 h-5 text-gray-500" />
          <select
            value={accessLevelFilter}
            onChange={(e) => setAccessLevelFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
          >
            <option value="all">All Access Levels</option>
            <option value="free">Free</option>
            <option value="preview">Preview</option>
            <option value="gyani">Gyani</option>
            <option value="pragyani">Pragyani</option>
            <option value="pragyani_plus">Pragyani Plus</option>
          </select>
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="video_teaching">Video Teaching</option>
            <option value="guided_meditation">Guided Meditation</option>
            <option value="qa">Q&A</option>
            <option value="essay">Essay</option>
          </select>
        </div>

        <input
          type="text"
          placeholder="Search teachings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
        />
      </div>

      {/* Teachings List */}
      <div className="grid gap-4">
        {paginatedTeachings.map((teaching) => (
          <div
            key={teaching.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-gray-400">
                    {getContentTypeIcon(teaching.content_type)}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {teaching.title}
                  </h3>

                  {/* Access Level Badge */}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    teaching.access_level === 'free'
                      ? 'bg-green-100 text-green-800'
                      : teaching.access_level === 'preview'
                      ? 'bg-blue-100 text-blue-800'
                      : teaching.access_level === 'gyani'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {teaching.access_level}
                  </span>

                  {/* Category Badge */}
                  {teaching.category && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {teaching.category}
                    </span>
                  )}

                  {/* Hidden Tag Badge */}
                  {teaching.hidden_tag && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      🏷️ {teaching.hidden_tag}
                    </span>
                  )}

                  {/* Featured Badges */}
                  {teaching.featured && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      ⭐ Featured
                    </span>
                  )}
                </div>

                {teaching.description && (
                  <p className="text-sm text-gray-600 mb-3">
                    {teaching.description.substring(0, 150)}{teaching.description.length > 150 && '...'}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                  {teaching.topic && (
                    <span className="px-2 py-1 bg-gray-50 rounded">Topic: {teaching.topic}</span>
                  )}
                  {teaching.duration && (
                    <span className="px-2 py-1 bg-gray-50 rounded">
                      {Math.floor(teaching.duration / 60)} min
                    </span>
                  )}
                  <span className="px-2 py-1 bg-gray-50 rounded">
                    {teaching.view_count} views
                  </span>
                  {teaching.tags && teaching.tags.length > 0 && (
                    <span className="px-2 py-1 bg-gray-50 rounded">
                      Tags: {teaching.tags.slice(0, 3).join(', ')}
                      {teaching.tags.length > 3 && ` +${teaching.tags.length - 3}`}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => openEditModal(teaching)}
                  className="text-[#7D1A13] hover:text-[#9d2419] p-2"
                  title="Edit"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(teaching.id)}
                  className="text-red-600 hover:text-red-800 p-2"
                  title="Delete"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {paginatedTeachings.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg">
            {filteredTeachings.length === 0
              ? 'No teachings found. Create your first teaching to get started.'
              : 'No teachings on this page.'}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          {/* Previous Button */}
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <ChevronLeftIcon className="w-5 h-5" />
            <span>Previous</span>
          </button>

          {/* Page Numbers */}
          <div className="flex gap-1">
            {(() => {
              const pages = [];
              const delta = 2; // Show 2 pages before and after current page

              // If total pages <= 9, show all pages
              if (totalPages <= 9) {
                for (let i = 1; i <= totalPages; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition ${
                        currentPage === i
                          ? 'bg-[#7D1A13] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {i}
                    </button>
                  );
                }
              } else {
                // Always show first page
                pages.push(
                  <button
                    key={1}
                    onClick={() => setCurrentPage(1)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition ${
                      currentPage === 1
                        ? 'bg-[#7D1A13] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    1
                  </button>
                );

                // Calculate range around current page
                const rangeStart = Math.max(2, currentPage - delta);
                const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

                // Show left ellipsis if there's a gap
                if (rangeStart > 2) {
                  pages.push(
                    <span key="ellipsis-left" className="w-10 h-10 flex items-center justify-center text-gray-500">
                      ...
                    </span>
                  );
                }

                // Show pages around current page
                for (let i = rangeStart; i <= rangeEnd; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition ${
                        currentPage === i
                          ? 'bg-[#7D1A13] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {i}
                    </button>
                  );
                }

                // Show right ellipsis if there's a gap
                if (rangeEnd < totalPages - 1) {
                  pages.push(
                    <span key="ellipsis-right" className="w-10 h-10 flex items-center justify-center text-gray-500">
                      ...
                    </span>
                  );
                }

                // Always show last page
                pages.push(
                  <button
                    key={totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition ${
                      currentPage === totalPages
                        ? 'bg-[#7D1A13] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {totalPages}
                  </button>
                );
              }

              return pages;
            })()}
          </div>

          {/* Next Button */}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium transition ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <span>Next</span>
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Create/Edit Teaching Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingTeaching ? 'Edit Teaching' : 'Create New Teaching'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          title: e.target.value,
                          slug: generateSlug(e.target.value),
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                    >
                      <option value="">Select category</option>
                      <option value="video_teaching">Video Teaching</option>
                      <option value="guided_meditation">Guided Meditation</option>
                      <option value="qa">Q&A</option>
                      <option value="essay">Essay</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Content Type & Access */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Content & Access</h3>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content Type *
                    </label>
                    <select
                      required
                      value={formData.content_type}
                      onChange={(e) => setFormData({ ...formData, content_type: e.target.value as ContentType })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                    >
                      <option value="video">Video</option>
                      <option value="videoandaudio">Video & Audio</option>
                      <option value="audio">Audio</option>
                      <option value="text">Text/Essay</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Access Level *
                    </label>
                    <select
                      required
                      value={formData.access_level}
                      onChange={(e) => setFormData({ ...formData, access_level: e.target.value as AccessLevel })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                    >
                      <option value="free">Free</option>
                      <option value="preview">Preview</option>
                      <option value="gyani">Gyani</option>
                      <option value="pragyani">Pragyani</option>
                      <option value="pragyani_plus">Pragyani Plus</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (seconds)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.duration || ''}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preview Duration (min)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.preview_duration || ''}
                      onChange={(e) => setFormData({ ...formData, preview_duration: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dashboard Preview (min)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.dash_preview_duration || ''}
                      onChange={(e) => setFormData({ ...formData, dash_preview_duration: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Published Date
                    </label>
                    <input
                      type="date"
                      value={formData.published_date ? formData.published_date.split('T')[0] : ''}
                      onChange={(e) => setFormData({ ...formData, published_date: e.target.value ? `${e.target.value}T00:00:00` : '' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Media URLs */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Media & Content</h3>

                <div className="grid grid-cols-2 gap-4">
                  {(formData.content_type === 'video' || formData.content_type === 'videoandaudio') && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Video URL
                      </label>
                      <input
                        type="url"
                        value={formData.video_url}
                        onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                      />
                    </div>
                  )}

                  {(formData.content_type === 'audio' || formData.content_type === 'videoandaudio') && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Audio URL
                      </label>
                      <input
                        type="url"
                        value={formData.audio_url}
                        onChange={(e) => setFormData({ ...formData, audio_url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                      />
                    </div>
                  )}

                  {/* Thumbnail Upload with Preview */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thumbnail Image
                    </label>

                    {/* Preview */}
                    {(thumbnailPreview || formData.thumbnail_url) && (
                      <div className="mb-3 relative inline-block">
                        <img
                          src={thumbnailPreview || formData.thumbnail_url}
                          alt="Thumbnail preview"
                          className="w-48 h-32 object-cover rounded-lg border-2 border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setThumbnailPreview('');
                            setFormData({ ...formData, thumbnail_url: '' });
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Upload Button */}
                    <div className="flex gap-3">
                      <label className={`flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition ${
                        thumbnailUploading
                          ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
                          : 'border-gray-300 hover:border-[#7D1A13] hover:bg-gray-50'
                      }`}>
                        {thumbnailUploading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#7D1A13]"></div>
                            <span className="text-sm text-gray-600">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <PhotoIcon className="w-5 h-5 text-gray-500" />
                            <span className="text-sm text-gray-700">
                              {thumbnailPreview || formData.thumbnail_url ? 'Change Thumbnail' : 'Upload Thumbnail'}
                            </span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                          onChange={handleThumbnailUpload}
                          disabled={thumbnailUploading}
                          className="hidden"
                        />
                      </label>

                      {/* Manual URL Input (optional) */}
                      <input
                        type="url"
                        value={formData.thumbnail_url}
                        onChange={(e) => {
                          setFormData({ ...formData, thumbnail_url: e.target.value });
                          setThumbnailPreview(e.target.value);
                        }}
                        placeholder="Or paste image URL"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Upload an image (max 10MB) or paste a URL
                    </p>
                  </div>

                  {formData.content_type === 'text' && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Text Content (Markdown)
                      </label>
                      <textarea
                        rows={8}
                        value={formData.text_content}
                        onChange={(e) => setFormData({ ...formData, text_content: e.target.value })}
                        placeholder="Enter your essay content in Markdown format..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent font-mono text-sm"
                      />
                    </div>
                  )}

                  {/* Cloudflare Video Upload */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cloudflare Stream Videos
                    </label>

                    {/* Upload Button */}
                    <div className="mb-3">
                      <label className={`flex items-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition ${
                        videoUploading
                          ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
                          : 'border-gray-300 hover:border-[#7D1A13] hover:bg-gray-50'
                      }`}>
                        {videoUploading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#7D1A13]"></div>
                            <div className="flex-1">
                              <span className="text-sm text-gray-700 block">Uploading video...</span>
                              <span className="text-xs text-gray-500">This may take several minutes for large files</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <ArrowUpTrayIcon className="w-6 h-6 text-gray-500" />
                            <div className="flex-1">
                              <span className="text-sm text-gray-700 block">Upload Video to Cloudflare Stream</span>
                              <span className="text-xs text-gray-500">MP4, MOV, AVI, WebM (max 5GB)</span>
                            </div>
                          </>
                        )}
                        <input
                          type="file"
                          accept="video/mp4,video/quicktime,video/x-msvideo,video/webm,video/avi,video/mov"
                          onChange={handleVideoUpload}
                          disabled={videoUploading}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Existing Video IDs */}
                    {formData.cloudflare_ids.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-600 mb-2">Uploaded Videos:</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.cloudflare_ids.map((id, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 text-sm rounded-lg"
                            >
                              <VideoCameraIcon className="w-4 h-4" />
                              <span className="font-mono text-xs">{id.substring(0, 12)}...</span>
                              <button
                                type="button"
                                onClick={() => removeTag('cloudflare_ids', index)}
                                className="hover:text-blue-900 ml-1"
                              >
                                <XMarkIcon className="w-4 h-4" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Manual ID Input (for existing videos) */}
                    <details className="mt-3">
                      <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                        Or add existing Cloudflare Stream ID manually
                      </summary>
                      <div className="flex gap-2 mt-2">
                        <input
                          type="text"
                          value={cloudflareIdInput}
                          onChange={(e) => setCloudflareIdInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('cloudflare_ids'))}
                          placeholder="Enter Cloudflare Stream UID"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => addTag('cloudflare_ids')}
                          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
                        >
                          Add
                        </button>
                      </div>
                    </details>
                  </div>

                  {/* Podbean IDs */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Podbean Audio IDs
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={podbeanIdInput}
                        onChange={(e) => setPodbeanIdInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('podbean_ids'))}
                        placeholder="Enter Podbean ID and press Enter"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => addTag('podbean_ids')}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.podbean_ids.map((id, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded"
                        >
                          {id}
                          <button
                            type="button"
                            onClick={() => removeTag('podbean_ids', index)}
                            className="hover:text-purple-900"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* YouTube IDs */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      YouTube Video IDs
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={youtubeIdInput}
                        onChange={(e) => setYoutubeIdInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('youtube_ids'))}
                        placeholder="Enter YouTube ID and press Enter"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => addTag('youtube_ids')}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.youtube_ids.map((id, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-sm rounded"
                        >
                          {id}
                          <button
                            type="button"
                            onClick={() => removeTag('youtube_ids', index)}
                            className="hover:text-red-900"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags & Classification */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Tags & Classification</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Topic
                    </label>
                    <input
                      type="text"
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      placeholder="e.g., Consciousness, Meditation, Yoga"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hidden Tag (for marketing pages)
                    </label>
                    <input
                      type="text"
                      value={formData.hidden_tag}
                      onChange={(e) => setFormData({ ...formData, hidden_tag: e.target.value })}
                      placeholder="e.g., homepage, about/shunyamurti"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Use this to display teaching cards on specific marketing pages
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('tags'))}
                        placeholder="Add a tag and press Enter"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => addTag('tags')}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                      >
                        Add Tag
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag('tags', index)}
                            className="hover:text-gray-900"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Filter Tags */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filter Tags
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={filterTagInput}
                        onChange={(e) => setFilterTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('filter_tags'))}
                        placeholder="Add a filter tag and press Enter"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => addTag('filter_tags')}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                      >
                        Add Filter Tag
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.filter_tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 text-sm rounded"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag('filter_tags', index)}
                            className="hover:text-indigo-900"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Flags */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Feature Flags</h3>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Featured
                    </label>
                    <select
                      value={formData.featured || ''}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.value || '' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                    >
                      <option value="">Not featured</option>
                      <option value="teaching">Featured Teaching</option>
                      <option value="meditation">Featured Meditation</option>
                      <option value="essay">Featured Essay</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Of the Month
                    </label>
                    <select
                      value={formData.of_the_month || ''}
                      onChange={(e) => setFormData({ ...formData, of_the_month: e.target.value || '' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                    >
                      <option value="">None</option>
                      <option value="meditation">Meditation of the Month</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pinned
                    </label>
                    <select
                      value={formData.pinned || ''}
                      onChange={(e) => setFormData({ ...formData, pinned: e.target.value || '' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                    >
                      <option value="">Not pinned</option>
                      <option value="essay">Pinned Essay</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#7D1A13] hover:bg-[#9d2419] text-white rounded-lg font-medium transition"
                >
                  {editingTeaching ? 'Update Teaching' : 'Create Teaching'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
