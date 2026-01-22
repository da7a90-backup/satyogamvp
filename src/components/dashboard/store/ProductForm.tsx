'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';

interface ProductFormProps {
  product?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [retreats, setRetreats] = useState<any[]>([]);
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>(['']);
  const [mp3Urls, setMp3Urls] = useState<string[]>(['']);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');

  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    description: '',
    short_description: '',
    type: 'AUDIO_VIDEO',
    price: '',
    regular_price: '',
    sale_price: '',
    retreat_id: '',
    thumbnail_url: '',
    featured_image: '',
    is_available: true,
    in_stock: true,
    published: false,
    featured: false,
  });

  useEffect(() => {
    loadRetreats();

    if (product) {
      setFormData({
        slug: product.slug || '',
        title: product.title || '',
        description: product.description || '',
        short_description: product.short_description || '',
        type: product.type || 'AUDIO_VIDEO',
        price: product.price || '',
        regular_price: product.regular_price || '',
        sale_price: product.sale_price || '',
        retreat_id: product.retreat_id || '',
        thumbnail_url: product.thumbnail_url || '',
        featured_image: product.featured_image || '',
        is_available: product.is_available ?? true,
        in_stock: product.in_stock ?? true,
        published: product.published || false,
        featured: product.featured || false,
      });

      // Load portal media
      if (product.portal_media) {
        setYoutubeUrls(product.portal_media.youtube || ['']);
        setMp3Urls(product.portal_media.mp3 || ['']);
      }

      // Load categories
      if (product.categories) {
        setCategories(product.categories);
      }
    }
  }, [product]);

  const loadRetreats = async () => {
    try {
      const token = session?.user?.accessToken || localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/retreats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRetreats(data);
      }
    } catch (error) {
      console.error('Failed to load retreats:', error);
    }
  };

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

  const addYoutubeUrl = () => {
    setYoutubeUrls([...youtubeUrls, '']);
  };

  const removeYoutubeUrl = (index: number) => {
    setYoutubeUrls(youtubeUrls.filter((_, i) => i !== index));
  };

  const updateYoutubeUrl = (index: number, value: string) => {
    const updated = [...youtubeUrls];
    updated[index] = value;
    setYoutubeUrls(updated);
  };

  const addMp3Url = () => {
    setMp3Urls([...mp3Urls, '']);
  };

  const removeMp3Url = (index: number) => {
    setMp3Urls(mp3Urls.filter((_, i) => i !== index));
  };

  const updateMp3Url = (index: number, value: string) => {
    const updated = [...mp3Urls];
    updated[index] = value;
    setMp3Urls(updated);
  };

  const addCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory('');
    }
  };

  const removeCategory = (category: string) => {
    setCategories(categories.filter(c => c !== category));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = session?.user?.accessToken || localStorage.getItem('authToken');

      // Prepare portal media
      const portalMedia = {
        youtube: youtubeUrls.filter(url => url.trim() !== ''),
        mp3: mp3Urls.filter(url => url.trim() !== ''),
        mp4: [],
        vimeo: [],
        cloudflare: [],
      };

      // Prepare data
      const dataToSend: any = {
        slug: formData.slug,
        title: formData.title,
        type: formData.type,
        price: parseFloat(formData.price),
        is_available: formData.is_available,
        in_stock: formData.in_stock,
        published: formData.published,
        featured: formData.featured,
        portal_media: portalMedia,
        categories: categories,
      };

      // Add optional fields
      if (formData.description) dataToSend.description = formData.description;
      if (formData.short_description) dataToSend.short_description = formData.short_description;
      if (formData.regular_price) dataToSend.regular_price = parseFloat(formData.regular_price);
      if (formData.sale_price) dataToSend.sale_price = parseFloat(formData.sale_price);
      if (formData.retreat_id) dataToSend.retreat_id = formData.retreat_id;
      if (formData.thumbnail_url) dataToSend.thumbnail_url = formData.thumbnail_url;
      if (formData.featured_image) dataToSend.featured_image = formData.featured_image;

      const url = product
        ? `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/products/${product.id}`
        : `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/products/`;

      const method = product ? 'PUT' : 'POST';

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
        alert(error.detail || 'Failed to save product');
      }
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product');
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
            {product ? 'Edit Product' : 'Create Product'}
          </h1>
          <p className="text-[#717680] mt-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            {product ? 'Update product details and link to retreats' : 'Create a new product or past retreat package'}
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
              Short Description
            </label>
            <input
              type="text"
              name="short_description"
              value={formData.short_description}
              onChange={handleChange}
              placeholder="Brief description for product card"
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
        </div>

        {/* Product Type & Pricing */}
        <div className="space-y-6 border-t pt-6">
          <h2 className="text-xl font-bold text-[#000000]" style={{ fontFamily: 'Optima, serif' }}>
            Type & Pricing
          </h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Product Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
              >
                <option value="AUDIO">Audio Only</option>
                <option value="VIDEO">Video Only</option>
                <option value="AUDIO_VIDEO">Audio & Video</option>
                <option value="AUDIO_VIDEO_TEXT">Audio, Video & Text</option>
                <option value="RETREAT_PORTAL_ACCESS">Retreat Portal Access</option>
                <option value="PHYSICAL">Physical Product</option>
                <option value="EBOOK">E-Book</option>
                <option value="GUIDED_MEDITATION">Guided Meditation</option>
                <option value="COLLECTION">Collection</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Price * ($)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Regular Price ($)
              </label>
              <input
                type="number"
                name="regular_price"
                value={formData.regular_price}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Sale Price ($)
              </label>
              <input
                type="number"
                name="sale_price"
                value={formData.sale_price}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Retreat Linking - THE KEY FEATURE */}
        <div className="space-y-6 border-t pt-6 bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-[#000000]" style={{ fontFamily: 'Optima, serif' }}>
            🔗 Link to Retreat (For Past Retreats)
          </h2>
          <p className="text-sm text-[#717680]">
            Link this product to a retreat to enable day-by-day portal access. Perfect for past retreat recordings.
          </p>

          <div>
            <label className="block text-sm font-medium text-[#000000] mb-2">
              Select Retreat (Optional)
            </label>
            <select
              name="retreat_id"
              value={formData.retreat_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
            >
              <option value="">-- No Retreat Link --</option>
              {retreats.map((retreat) => (
                <option key={retreat.id} value={retreat.id}>
                  {retreat.title} {!retreat.is_published && '(Unpublished)'}
                </option>
              ))}
            </select>
            <p className="text-xs text-[#717680] mt-1">
              When linked, users will see structured day-by-day content from the retreat portal
            </p>
          </div>
        </div>

        {/* Portal Media */}
        <div className="space-y-6 border-t pt-6">
          <h2 className="text-xl font-bold text-[#000000]" style={{ fontFamily: 'Optima, serif' }}>
            Portal Media
          </h2>
          <p className="text-sm text-[#717680]">
            Add media files that users can access after purchase. These are used when no retreat is linked or as fallback.
          </p>

          {/* YouTube URLs */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-[#000000]">
                YouTube Video URLs
              </label>
              <Button
                type="button"
                onClick={addYoutubeUrl}
                size="sm"
                variant="outline"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add URL
              </Button>
            </div>
            <div className="space-y-2">
              {youtubeUrls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => updateYoutubeUrl(index, e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <Button
                    type="button"
                    onClick={() => removeYoutubeUrl(index)}
                    size="sm"
                    variant="outline"
                    className="text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* MP3 URLs */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-[#000000]">
                MP3 Audio URLs
              </label>
              <Button
                type="button"
                onClick={addMp3Url}
                size="sm"
                variant="outline"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add URL
              </Button>
            </div>
            <div className="space-y-2">
              {mp3Urls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => updateMp3Url(index, e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <Button
                    type="button"
                    onClick={() => removeMp3Url(index)}
                    size="sm"
                    variant="outline"
                    className="text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-6 border-t pt-6">
          <h2 className="text-xl font-bold text-[#000000]" style={{ fontFamily: 'Optima, serif' }}>
            Categories
          </h2>
          <p className="text-sm text-[#717680]">
            Add "past-retreat" category to show the past retreat badge in store
          </p>

          <div>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                placeholder="Enter category (e.g., past-retreat)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <Button
                type="button"
                onClick={addCategory}
                size="sm"
              >
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <span
                  key={category}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
                >
                  {category}
                  <button
                    type="button"
                    onClick={() => removeCategory(category)}
                    className="hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
              <p className="text-xs text-yellow-800">
                💡 <strong>Tip:</strong> Add "past-retreat" category for products linked to past retreat recordings
              </p>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="space-y-6 border-t pt-6">
          <h2 className="text-xl font-bold text-[#000000]" style={{ fontFamily: 'Optima, serif' }}>
            Images
          </h2>

          <div className="grid grid-cols-2 gap-6">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#000000] mb-2">
                Featured Image URL
              </label>
              <input
                type="url"
                name="featured_image"
                value={formData.featured_image}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
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
                name="published"
                checked={formData.published}
                onChange={handleChange}
                className="w-4 h-4 text-[#7D1A13] border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-[#000000]">Published (visible in store)</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="w-4 h-4 text-[#7D1A13] border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-[#000000]">Featured</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_available"
                checked={formData.is_available}
                onChange={handleChange}
                className="w-4 h-4 text-[#7D1A13] border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-[#000000]">Available for purchase</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="in_stock"
                checked={formData.in_stock}
                onChange={handleChange}
                className="w-4 h-4 text-[#7D1A13] border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-[#000000]">In Stock</span>
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
                {product ? 'Update Product' : 'Create Product'}
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
