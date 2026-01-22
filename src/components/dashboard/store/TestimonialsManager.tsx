'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Save, X, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';

interface Testimonial {
  id: string;
  product_id: string;
  quote: string;
  author_name: string;
  author_location: string | null;
  author_avatar_url: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface TestimonialsManagerProps {
  productId: string;
  productTitle: string;
  onClose: () => void;
}

export default function TestimonialsManager({ productId, productTitle, onClose }: TestimonialsManagerProps) {
  const { data: session } = useSession();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [formData, setFormData] = useState({
    quote: '',
    author_name: '',
    author_location: '',
    author_avatar_url: '',
    is_active: true
  });

  useEffect(() => {
    loadTestimonials();
  }, [productId]);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      const token = session?.user?.accessToken || localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/testimonials?product_id=${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTestimonials(data);
      }
    } catch (error) {
      console.error('Failed to load testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const token = session?.user?.accessToken || localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/testimonials`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            product_id: productId,
            ...formData,
            order_index: testimonials.length,
          }),
        }
      );

      if (response.ok) {
        setCreatingNew(false);
        setFormData({
          quote: '',
          author_name: '',
          author_location: '',
          author_avatar_url: '',
          is_active: true
        });
        await loadTestimonials();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to create testimonial');
      }
    } catch (error) {
      console.error('Failed to create testimonial:', error);
      alert('Failed to create testimonial');
    }
  };

  const handleUpdate = async (testimonialId: string) => {
    try {
      const token = session?.user?.accessToken || localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/testimonials/${testimonialId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        setEditingId(null);
        await loadTestimonials();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to update testimonial');
      }
    } catch (error) {
      console.error('Failed to update testimonial:', error);
      alert('Failed to update testimonial');
    }
  };

  const handleDelete = async (testimonialId: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) {
      return;
    }

    try {
      const token = session?.user?.accessToken || localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/testimonials/${testimonialId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await loadTestimonials();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to delete testimonial');
      }
    } catch (error) {
      console.error('Failed to delete testimonial:', error);
      alert('Failed to delete testimonial');
    }
  };

  const handleToggleActive = async (testimonial: Testimonial) => {
    try {
      const token = session?.user?.accessToken || localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/testimonials/${testimonial.id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ is_active: !testimonial.is_active }),
        }
      );

      if (response.ok) {
        await loadTestimonials();
      }
    } catch (error) {
      console.error('Failed to toggle testimonial:', error);
    }
  };

  const handleReorder = async (testimonialId: string, direction: 'up' | 'down') => {
    const currentIndex = testimonials.findIndex(t => t.id === testimonialId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= testimonials.length) return;

    try {
      const token = session?.user?.accessToken || localStorage.getItem('authToken');
      const reorderData = [
        { testimonial_id: testimonials[currentIndex].id, new_order_index: newIndex },
        { testimonial_id: testimonials[newIndex].id, new_order_index: currentIndex },
      ];

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/testimonials/reorder`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reorderData),
        }
      );

      if (response.ok) {
        await loadTestimonials();
      }
    } catch (error) {
      console.error('Failed to reorder testimonials:', error);
    }
  };

  const startEdit = (testimonial: Testimonial) => {
    setEditingId(testimonial.id);
    setFormData({
      quote: testimonial.quote,
      author_name: testimonial.author_name,
      author_location: testimonial.author_location || '',
      author_avatar_url: testimonial.author_avatar_url || '',
      is_active: testimonial.is_active
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setCreatingNew(false);
    setFormData({
      quote: '',
      author_name: '',
      author_location: '',
      author_avatar_url: '',
      is_active: true
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-[#000000]" style={{ fontFamily: 'Optima, serif' }}>
              Testimonials for {productTitle}
            </h2>
            <p className="text-[#717680] mt-1" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              Manage customer testimonials and reviews
            </p>
          </div>
          <Button onClick={onClose} variant="ghost" size="sm">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Create button */}
          {!creatingNew && !editingId && (
            <Button
              onClick={() => setCreatingNew(true)}
              className="mb-6 bg-[#7D1A13] hover:bg-[#7D1A13]/90 text-white"
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Testimonial
            </Button>
          )}

          {/* Create form */}
          {creatingNew && (
            <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Optima, serif' }}>
                New Testimonial
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                    Quote *
                  </label>
                  <textarea
                    value={formData.quote}
                    onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                    rows={3}
                    required
                    style={{ fontFamily: 'Avenir Next, sans-serif' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                    Author Name *
                  </label>
                  <input
                    type="text"
                    value={formData.author_name}
                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                    required
                    style={{ fontFamily: 'Avenir Next, sans-serif' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.author_location}
                    onChange={(e) => setFormData({ ...formData, author_location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                    placeholder="e.g. California, USA"
                    style={{ fontFamily: 'Avenir Next, sans-serif' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                    Avatar URL
                  </label>
                  <input
                    type="text"
                    value={formData.author_avatar_url}
                    onChange={(e) => setFormData({ ...formData, author_avatar_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                    placeholder="https://..."
                    style={{ fontFamily: 'Avenir Next, sans-serif' }}
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleCreate}
                    disabled={!formData.quote || !formData.author_name}
                    className="bg-[#7D1A13] hover:bg-[#7D1A13]/90 text-white"
                    style={{ fontFamily: 'Avenir Next, sans-serif' }}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Create
                  </Button>
                  <Button onClick={cancelEdit} variant="outline" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Testimonials list */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D1A13] mx-auto"></div>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-[#717680]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                No testimonials yet. Add your first testimonial to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className={`p-6 rounded-lg border ${
                    testimonial.is_active ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  {editingId === testimonial.id ? (
                    // Edit form
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                          Quote *
                        </label>
                        <textarea
                          value={formData.quote}
                          onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                          rows={3}
                          style={{ fontFamily: 'Avenir Next, sans-serif' }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                            Author Name *
                          </label>
                          <input
                            type="text"
                            value={formData.author_name}
                            onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                            style={{ fontFamily: 'Avenir Next, sans-serif' }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                            Location
                          </label>
                          <input
                            type="text"
                            value={formData.author_location}
                            onChange={(e) => setFormData({ ...formData, author_location: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                            style={{ fontFamily: 'Avenir Next, sans-serif' }}
                          />
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleUpdate(testimonial.id)}
                          className="bg-[#7D1A13] hover:bg-[#7D1A13]/90 text-white"
                          style={{ fontFamily: 'Avenir Next, sans-serif' }}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button onClick={cancelEdit} variant="outline" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Display mode
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <p className="text-gray-800 italic mb-3" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                            "{testimonial.quote}"
                          </p>
                          <p className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                            {testimonial.author_name}
                            {testimonial.author_location && (
                              <span className="text-gray-500 font-normal ml-2">
                                {testimonial.author_location}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          {/* Reorder buttons */}
                          <div className="flex flex-col gap-1">
                            <Button
                              onClick={() => handleReorder(testimonial.id, 'up')}
                              disabled={index === 0}
                              variant="outline"
                              size="sm"
                              title="Move up"
                              className="p-1 h-6"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </Button>
                            <Button
                              onClick={() => handleReorder(testimonial.id, 'down')}
                              disabled={index === testimonials.length - 1}
                              variant="outline"
                              size="sm"
                              title="Move down"
                              className="p-1 h-6"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </Button>
                          </div>
                          {/* Toggle active */}
                          <Button
                            onClick={() => handleToggleActive(testimonial)}
                            variant="outline"
                            size="sm"
                            title={testimonial.is_active ? 'Hide testimonial' : 'Show testimonial'}
                            className={testimonial.is_active ? '' : 'text-gray-500'}
                          >
                            {testimonial.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </Button>
                          {/* Edit button */}
                          <Button
                            onClick={() => startEdit(testimonial)}
                            variant="outline"
                            size="sm"
                            title="Edit testimonial"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {/* Delete button */}
                          <Button
                            onClick={() => handleDelete(testimonial.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete testimonial"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {!testimonial.is_active && (
                        <span className="inline-block px-2 py-1 text-xs font-semibold bg-gray-200 text-gray-600 rounded">
                          HIDDEN
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
