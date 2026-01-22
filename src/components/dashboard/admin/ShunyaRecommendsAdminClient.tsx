'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Recommendation } from '@/lib/recommendations-api';
import { Plus, Edit, Trash2, X, Upload } from 'lucide-react';
import {
  createRecommendation,
  updateRecommendation,
  deleteRecommendation,
  uploadCoverImage,
} from '@/lib/recommendations-api';

interface ShunyaRecommendsAdminClientProps {
  initialRecommendations: Recommendation[];
  errorMessage: string;
}

type FormMode = 'create' | 'edit' | null;

export default function ShunyaRecommendsAdminClient({
  initialRecommendations,
  errorMessage: initialError,
}: ShunyaRecommendsAdminClientProps) {
  const { data: session } = useSession();
  const [recommendations, setRecommendations] = useState<Recommendation[]>(initialRecommendations);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editingRec, setEditingRec] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError);
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    description: '',
    recommendationType: 'book' as 'book' | 'documentary',
    author: '',
    amazonUrl: '',
    coverImageUrl: '',
    youtubeId: '',
    duration: 0,
    thumbnailUrl: '',
    category: '',
    accessLevel: 'gyani',
    displayOrder: 0,
    publishedDate: '',
  });

  const resetForm = () => {
    setFormData({
      slug: '',
      title: '',
      description: '',
      recommendationType: 'book',
      author: '',
      amazonUrl: '',
      coverImageUrl: '',
      youtubeId: '',
      duration: 0,
      thumbnailUrl: '',
      category: '',
      accessLevel: 'gyani',
      displayOrder: 0,
      publishedDate: '',
    });
    setEditingRec(null);
    setFormMode(null);
  };

  const handleCreate = () => {
    resetForm();
    setFormMode('create');
  };

  const handleEdit = (rec: Recommendation) => {
    setEditingRec(rec);
    setFormData({
      slug: rec.slug,
      title: rec.title,
      description: rec.description || '',
      recommendationType: rec.recommendationType,
      author: rec.author || '',
      amazonUrl: rec.amazonUrl || '',
      coverImageUrl: rec.coverImageUrl || '',
      youtubeId: rec.youtubeId || '',
      duration: rec.duration || 0,
      thumbnailUrl: rec.thumbnailUrl || '',
      category: rec.category || '',
      accessLevel: rec.accessLevel,
      displayOrder: rec.displayOrder,
      publishedDate: rec.publishedDate || '',
    });
    setFormMode('edit');
  };

  const handleDelete = async (rec: Recommendation) => {
    if (!confirm(`Are you sure you want to delete "${rec.title}"?`)) return;

    setLoading(true);
    setError('');

    try {
      const token = (session?.user as any)?.accessToken;
      await deleteRecommendation(token, rec.id);
      setRecommendations(recommendations.filter((r) => r.id !== rec.id));
      setSuccess('Recommendation deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete recommendation');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = (session?.user as any)?.accessToken;

      if (formMode === 'create') {
        const newRec = await createRecommendation(token, formData);
        setRecommendations([...recommendations, newRec]);
        setSuccess('Recommendation created successfully');
      } else if (formMode === 'edit' && editingRec) {
        const updatedRec = await updateRecommendation(token, editingRec.id, formData);
        setRecommendations(recommendations.map((r) => (r.id === updatedRec.id ? updatedRec : r)));
        setSuccess('Recommendation updated successfully');
      }

      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save recommendation');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const token = (session?.user as any)?.accessToken;
      const result = await uploadCoverImage(token, file);
      setFormData({ ...formData, coverImageUrl: result.url });
      setSuccess('Image uploaded successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const books = recommendations.filter((r) => r.recommendationType === 'book');
  const documentaries = recommendations.filter((r) => r.recommendationType === 'documentary');

  return (
    <div className="min-h-screen bg-[#FAF8F1] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#000000] mb-2">
              Shunyamurti Recommends Management
            </h1>
            <p className="text-lg text-[#717680]">
              Manage books and documentaries for GYANI+ members
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-[#8B7355] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#6F5B44] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add New
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-2xl font-bold text-[#8B7355]">{recommendations.length}</div>
            <div className="text-sm text-[#717680]">Total Recommendations</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-2xl font-bold text-[#8B7355]">{books.length}</div>
            <div className="text-sm text-[#717680]">Books</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-2xl font-bold text-[#8B7355]">{documentaries.length}</div>
            <div className="text-sm text-[#717680]">Documentaries</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F5F5F5] border-b border-[#E5E5E5]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#000000]">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#000000]">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#000000]">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#000000]">Order</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-[#000000]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {recommendations
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((rec) => (
                    <tr key={rec.id} className="hover:bg-[#FAF8F1] transition-colors">
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 text-xs rounded-full ${
                            rec.recommendationType === 'book'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {rec.recommendationType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-[#000000]">{rec.title}</div>
                        {rec.author && <div className="text-sm text-[#717680]">{rec.author}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[#717680]">{rec.category || '—'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[#717680]">{rec.displayOrder}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(rec)}
                            className="p-2 text-[#8B7355] hover:bg-[#8B7355] hover:bg-opacity-10 rounded transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(rec)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form Modal */}
        {formMode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-[#E5E5E5] px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-[#000000]">
                  {formMode === 'create' ? 'Add New Recommendation' : 'Edit Recommendation'}
                </h2>
                <button onClick={resetForm} className="text-[#717680] hover:text-[#000000]">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Type */}
                <div>
                  <label className="block text-sm font-semibold text-[#000000] mb-2">Type *</label>
                  <select
                    value={formData.recommendationType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recommendationType: e.target.value as 'book' | 'documentary',
                      })
                    }
                    className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355]"
                    required
                  >
                    <option value="book">Book</option>
                    <option value="documentary">Documentary</option>
                  </select>
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-semibold text-[#000000] mb-2">Slug *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355]"
                    placeholder="example-book-title"
                    required
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-[#000000] mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355]"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-[#000000] mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355]"
                    rows={3}
                  />
                </div>

                {/* Conditional Fields for Books */}
                {formData.recommendationType === 'book' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-[#000000] mb-2">Author</label>
                      <input
                        type="text"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#000000] mb-2">Amazon URL</label>
                      <input
                        type="url"
                        value={formData.amazonUrl}
                        onChange={(e) => setFormData({ ...formData, amazonUrl: e.target.value })}
                        className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355]"
                        placeholder="https://amazon.com/..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#000000] mb-2">Cover Image</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.coverImageUrl}
                          onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                          className="flex-1 px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355]"
                          placeholder="Image URL"
                        />
                        <label className="flex items-center gap-2 px-4 py-2 border border-[#E5E5E5] rounded-lg cursor-pointer hover:bg-[#F5F5F5]">
                          <Upload className="w-4 h-4" />
                          Upload
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </>
                )}

                {/* Conditional Fields for Documentaries */}
                {formData.recommendationType === 'documentary' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-[#000000] mb-2">YouTube ID</label>
                      <input
                        type="text"
                        value={formData.youtubeId}
                        onChange={(e) => setFormData({ ...formData, youtubeId: e.target.value })}
                        className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355]"
                        placeholder="dQw4w9WgXcQ"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#000000] mb-2">Duration (seconds)</label>
                      <input
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355]"
                      />
                    </div>
                  </>
                )}

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-[#000000] mb-2">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355]"
                    placeholder="Spirituality, Philosophy, etc."
                  />
                </div>

                {/* Display Order */}
                <div>
                  <label className="block text-sm font-semibold text-[#000000] mb-2">Display Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355]"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 border border-[#E5E5E5] rounded-lg hover:bg-[#F5F5F5] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-[#8B7355] text-white rounded-lg hover:bg-[#6F5B44] transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : formMode === 'create' ? 'Create' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
