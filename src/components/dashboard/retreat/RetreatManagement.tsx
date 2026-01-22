'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Eye, Calendar, Layers, FileText } from 'lucide-react';
import RetreatForm from './RetreatForm';
import RetreatContentEditor from './RetreatContentEditor';
import { useRouter } from 'next/navigation';

interface Retreat {
  id: string;
  slug: string;
  title: string;
  type: string;
  start_date?: string;
  end_date?: string;
  is_published: boolean;
  forum_enabled: boolean;
  thumbnail_url?: string;
  price_lifetime?: number;
  price_limited?: number;
  created_at: string;
}

export default function RetreatManagement() {
  const { data: session } = useSession();
  const router = useRouter();
  const [retreats, setRetreats] = useState<Retreat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRetreat, setEditingRetreat] = useState<Retreat | null>(null);
  const [filter, setFilter] = useState<'all' | 'published' | 'unpublished'>('all');
  const [managingContent, setManagingContent] = useState<Retreat | null>(null);

  useEffect(() => {
    loadRetreats();
  }, [session]);

  const loadRetreats = async () => {
    try {
      setLoading(true);
      const token = session?.user?.accessToken || localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/retreats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRetreats(data);
      }
    } catch (error) {
      console.error('Failed to load retreats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRetreat(null);
    setShowForm(true);
  };

  const handleEdit = (retreat: Retreat) => {
    setEditingRetreat(retreat);
    setShowForm(true);
  };

  const handleDelete = async (retreatId: string) => {
    if (!confirm('Are you sure you want to delete this retreat? This action cannot be undone.')) {
      return;
    }

    try {
      const token = session?.user?.accessToken || localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/admin/retreats/${retreatId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await loadRetreats();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to delete retreat');
      }
    } catch (error) {
      console.error('Failed to delete retreat:', error);
      alert('Failed to delete retreat');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingRetreat(null);
    loadRetreats();
  };

  const filteredRetreats = retreats.filter(r => {
    if (filter === 'published') return r.is_published;
    if (filter === 'unpublished') return !r.is_published;
    return true;
  });

  if (showForm) {
    return (
      <div className="p-8">
        <RetreatForm
          retreat={editingRetreat}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingRetreat(null);
          }}
        />
      </div>
    );
  }

  // Show content editor modal
  if (managingContent) {
    return (
      <>
        <div className="p-8">
          {/* Main content with backdrop */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#000000]" style={{ fontFamily: 'Optima, serif' }}>
              Retreats Management
            </h1>
          </div>
        </div>
        <RetreatContentEditor
          retreatId={managingContent.id}
          retreatTitle={managingContent.title}
          onClose={() => setManagingContent(null)}
        />
      </>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#000000]" style={{ fontFamily: 'Optima, serif' }}>
            Retreats Management
          </h1>
          <p className="text-[#717680] mt-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            Manage active retreats and past retreat content
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-[#7D1A13] hover:bg-[#7D1A13]/90 text-white"
          style={{ fontFamily: 'Avenir Next, sans-serif' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Retreat
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-[#7D1A13] text-white'
              : 'bg-white text-[#717680] border border-gray-200 hover:bg-gray-50'
          }`}
          style={{ fontFamily: 'Avenir Next, sans-serif' }}
        >
          All ({retreats.length})
        </button>
        <button
          onClick={() => setFilter('published')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'published'
              ? 'bg-[#7D1A13] text-white'
              : 'bg-white text-[#717680] border border-gray-200 hover:bg-gray-50'
          }`}
          style={{ fontFamily: 'Avenir Next, sans-serif' }}
        >
          Published ({retreats.filter(r => r.is_published).length})
        </button>
        <button
          onClick={() => setFilter('unpublished')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'unpublished'
              ? 'bg-[#7D1A13] text-white'
              : 'bg-white text-[#717680] border border-gray-200 hover:bg-gray-50'
          }`}
          style={{ fontFamily: 'Avenir Next, sans-serif' }}
        >
          Unpublished ({retreats.filter(r => !r.is_published).length})
        </button>
      </div>

      {/* Retreats List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D1A13] mx-auto"></div>
        </div>
      ) : filteredRetreats.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-[#717680]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            No retreats found. Create your first retreat to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRetreats.map((retreat) => (
            <div
              key={retreat.id}
              className="bg-white rounded-lg shadow-sm p-6 flex items-center gap-6 hover:shadow-md transition-shadow"
            >
              {retreat.thumbnail_url && (
                <img
                  src={retreat.thumbnail_url}
                  alt={retreat.title}
                  className="w-32 h-32 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-[#000000]" style={{ fontFamily: 'Optima, serif' }}>
                    {retreat.title}
                  </h3>
                  {!retreat.is_published && (
                    <span className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded-full">
                      UNPUBLISHED
                    </span>
                  )}
                  {retreat.forum_enabled && (
                    <span className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-600 rounded-full">
                      FORUM
                    </span>
                  )}
                </div>
                <p className="text-[#717680] mb-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                  Type: <span className="capitalize">{retreat.type.replace('_', ' ')}</span>
                </p>
                {(retreat.start_date || retreat.end_date) && (
                  <div className="flex items-center gap-2 text-sm text-[#717680]">
                    <Calendar className="w-4 h-4" />
                    <span style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                      {retreat.start_date && new Date(retreat.start_date).toLocaleDateString()} -{' '}
                      {retreat.end_date && new Date(retreat.end_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {(retreat.price_lifetime || retreat.price_limited) && (
                  <div className="mt-2 text-sm text-[#717680]">
                    {retreat.price_lifetime && (
                      <span className="mr-4">Lifetime: ${retreat.price_lifetime}</span>
                    )}
                    {retreat.price_limited && (
                      <span>Limited: ${retreat.price_limited}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setManagingContent(retreat)}
                  variant="outline"
                  size="sm"
                  title="Edit page content (included items, intro, schedule)"
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                >
                  <FileText className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => router.push(`/dashboard/admin/retreats/${retreat.id}/portal`)}
                  variant="outline"
                  size="sm"
                  title="Edit portal content (days/sessions)"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Layers className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => window.open(`/retreats/online/${retreat.slug}`, '_blank')}
                  variant="outline"
                  size="sm"
                  title="View retreat page"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handleEdit(retreat)}
                  variant="outline"
                  size="sm"
                  title="Edit retreat details"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handleDelete(retreat.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Delete retreat"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
