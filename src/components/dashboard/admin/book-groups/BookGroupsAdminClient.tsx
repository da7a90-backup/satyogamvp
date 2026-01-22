'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAllBookGroupsAdmin, deleteBookGroup, markBookGroupCompleted } from '@/lib/book-groups-api';
import { BookGroupAdmin, BookGroupStatus } from '@/types/book-group';
import { Plus, Eye, Edit2, Trash2, CheckCircle, Package } from 'lucide-react';

interface BookGroupsAdminClientProps {
  userJwt: string | null;
}

export default function BookGroupsAdminClient({ userJwt }: BookGroupsAdminClientProps) {
  const router = useRouter();
  const [bookGroups, setBookGroups] = useState<BookGroupAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'all' | BookGroupStatus>('all');

  useEffect(() => {
    loadBookGroups();
  }, []);

  async function loadBookGroups() {
    if (!userJwt) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    try {
      const data = await getAllBookGroupsAdmin();
      setBookGroups(data);
      setLoading(false);
    } catch (err: any) {
      console.error('Failed to load book groups:', err);
      setError(err.message || 'Failed to load book groups');
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this book group? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteBookGroup(id);
      setBookGroups(bookGroups.filter(bg => bg.id !== id));
      alert('Book group deleted successfully');
    } catch (err: any) {
      alert(`Failed to delete book group: ${err.message}`);
    }
  }

  async function handleMarkCompleted(id: string) {
    if (!confirm('Mark this book group as completed? Zoom links will be replaced with video recordings.')) {
      return;
    }

    try {
      await markBookGroupCompleted(id, { replace_zoom_with_videos: true });
      await loadBookGroups(); // Reload to get updated data
      alert('Book group marked as completed');
    } catch (err: any) {
      alert(`Failed to mark as completed: ${err.message}`);
    }
  }

  const filteredBookGroups = selectedStatus === 'all'
    ? bookGroups
    : bookGroups.filter(bg => bg.status === selectedStatus);

  const statusCounts = {
    all: bookGroups.length,
    upcoming: bookGroups.filter(bg => bg.status === BookGroupStatus.UPCOMING).length,
    live: bookGroups.filter(bg => bg.status === BookGroupStatus.LIVE).length,
    completed: bookGroups.filter(bg => bg.status === BookGroupStatus.COMPLETED).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F1] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#7D1A13] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#717680]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            Loading book groups...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF8F1] flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-[#000000] mb-4" style={{ fontFamily: 'Optima, serif' }}>
            Error
          </h2>
          <p className="text-[#717680] mb-6" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:min-h-[125vh] bg-[#FAF8F1] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#000000] mb-2" style={{ fontFamily: 'Optima, serif' }}>
              Book Groups Management
            </h1>
            <p className="text-[#717680]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              Manage book groups, sessions, and access control
            </p>
          </div>

          <button
            onClick={() => alert('Create form coming soon! Use backend API directly for now.')}
            className="flex items-center gap-2 px-6 py-3 bg-[#7D1A13] text-white rounded-lg hover:bg-[#6B150F] transition-colors font-semibold"
            style={{ fontFamily: 'Avenir Next, sans-serif' }}
          >
            <Plus size={20} />
            Create Book Group
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-sm text-[#717680] mb-1" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              Total Book Groups
            </div>
            <div className="text-3xl font-bold text-[#000000]" style={{ fontFamily: 'Optima, serif' }}>
              {statusCounts.all}
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-sm text-[#717680] mb-1" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              Live
            </div>
            <div className="text-3xl font-bold text-green-600" style={{ fontFamily: 'Optima, serif' }}>
              {statusCounts.live}
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-sm text-[#717680] mb-1" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              Upcoming
            </div>
            <div className="text-3xl font-bold text-blue-600" style={{ fontFamily: 'Optima, serif' }}>
              {statusCounts.upcoming}
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-sm text-[#717680] mb-1" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              Completed
            </div>
            <div className="text-3xl font-bold text-gray-600" style={{ fontFamily: 'Optima, serif' }}>
              {statusCounts.completed}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex gap-4">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === 'all'
                  ? 'bg-[#7D1A13] text-white'
                  : 'bg-gray-100 text-[#717680] hover:bg-gray-200'
              }`}
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              All ({statusCounts.all})
            </button>
            <button
              onClick={() => setSelectedStatus(BookGroupStatus.LIVE)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === BookGroupStatus.LIVE
                  ? 'bg-[#7D1A13] text-white'
                  : 'bg-gray-100 text-[#717680] hover:bg-gray-200'
              }`}
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              Live ({statusCounts.live})
            </button>
            <button
              onClick={() => setSelectedStatus(BookGroupStatus.UPCOMING)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === BookGroupStatus.UPCOMING
                  ? 'bg-[#7D1A13] text-white'
                  : 'bg-gray-100 text-[#717680] hover:bg-gray-200'
              }`}
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              Upcoming ({statusCounts.upcoming})
            </button>
            <button
              onClick={() => setSelectedStatus(BookGroupStatus.COMPLETED)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === BookGroupStatus.COMPLETED
                  ? 'bg-[#7D1A13] text-white'
                  : 'bg-gray-100 text-[#717680] hover:bg-gray-200'
              }`}
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              Completed ({statusCounts.completed})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-[#E5E7EB]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#717680] uppercase tracking-wider" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                  Book Group
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#717680] uppercase tracking-wider" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#717680] uppercase tracking-wider" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                  Sessions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#717680] uppercase tracking-wider" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                  Access
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#717680] uppercase tracking-wider" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                  Users
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#717680] uppercase tracking-wider" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredBookGroups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#717680]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                    No book groups found. Create your first book group to get started.
                  </td>
                </tr>
              ) : (
                filteredBookGroups.map((bookGroup) => (
                  <tr key={bookGroup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-[#000000]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                          {bookGroup.title}
                        </div>
                        <div className="text-sm text-[#717680]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                          {bookGroup.slug}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          bookGroup.status === BookGroupStatus.LIVE
                            ? 'bg-green-100 text-green-800'
                            : bookGroup.status === BookGroupStatus.UPCOMING
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                        style={{ fontFamily: 'Avenir Next, sans-serif' }}
                      >
                        {bookGroup.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#717680]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                      {bookGroup.session_count}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#717680]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                        {bookGroup.requires_purchase ? 'Purchase Required' : 'Gyani+ Members'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#717680]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                      {bookGroup.access_count || 0}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => router.push(`/dashboard/user/book-groups/${bookGroup.slug}`)}
                          className="p-2 text-[#717680] hover:text-[#000000] hover:bg-gray-100 rounded transition-colors"
                          title="View Portal"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => alert('Edit form coming soon! Use backend API directly for now.')}
                          className="p-2 text-[#717680] hover:text-[#000000] hover:bg-gray-100 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        {bookGroup.status !== BookGroupStatus.COMPLETED && (
                          <button
                            onClick={() => handleMarkCompleted(bookGroup.id)}
                            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                            title="Mark as Completed"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        {bookGroup.status === BookGroupStatus.COMPLETED && !bookGroup.store_product_id && (
                          <button
                            onClick={() => alert('Convert to product form coming soon! Use backend API directly for now.')}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                            title="Convert to Store Product"
                          >
                            <Package size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(bookGroup.id)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Helper Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            Quick Admin Guide
          </h3>
          <ul className="text-sm text-blue-800 space-y-1" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            <li>• <strong>View Portal:</strong> See the book group as users see it</li>
            <li>• <strong>Mark as Completed:</strong> Changes status to completed and replaces Zoom links with videos</li>
            <li>• <strong>Convert to Product:</strong> Package completed book groups as store products for sale</li>
            <li>• <strong>Create/Edit Forms:</strong> Coming soon! Use the backend API endpoints directly for now</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
