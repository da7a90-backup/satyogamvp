'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Eye, DollarSign, MessageSquare } from 'lucide-react';
import ProductForm from './ProductForm';
import TestimonialsManager from './TestimonialsManager';

interface Product {
  id: string;
  slug: string;
  title: string;
  type: string;
  price: number;
  published: boolean;
  featured: boolean;
  thumbnail_url?: string;
  retreat_id?: string;
  categories?: string[];
  created_at: string;
}

export default function StoreManagement() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filter, setFilter] = useState<'all' | 'published' | 'unpublished'>('all');
  const [managingTestimonials, setManagingTestimonials] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, [session]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const token = session?.user?.accessToken || localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/products`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const token = session?.user?.accessToken || localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/products/${productId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await loadProducts();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProduct(null);
    loadProducts();
  };

  const filteredProducts = products.filter(p => {
    if (filter === 'published') return p.published;
    if (filter === 'unpublished') return !p.published;
    return true;
  });

  if (showForm) {
    return (
      <div className="p-8">
        <ProductForm
          product={editingProduct}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
        />
      </div>
    );
  }

  // Show testimonials manager modal
  if (managingTestimonials) {
    return (
      <>
        <div className="p-8">
          {/* Main content with backdrop */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#000000]" style={{ fontFamily: 'Optima, serif' }}>
              Products Management
            </h1>
          </div>
        </div>
        <TestimonialsManager
          productId={managingTestimonials.id}
          productTitle={managingTestimonials.title}
          onClose={() => setManagingTestimonials(null)}
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
            Products Management
          </h1>
          <p className="text-[#717680] mt-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            Manage store products and link past retreats
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-[#7D1A13] hover:bg-[#7D1A13]/90 text-white"
          style={{ fontFamily: 'Avenir Next, sans-serif' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Product
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
          All ({products.length})
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
          Published ({products.filter(p => p.published).length})
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
          Unpublished ({products.filter(p => !p.published).length})
        </button>
      </div>

      {/* Products List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D1A13] mx-auto"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-[#717680]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            No products found. Create your first product to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-sm p-6 flex items-center gap-6 hover:shadow-md transition-shadow"
            >
              {product.thumbnail_url && (
                <img
                  src={product.thumbnail_url}
                  alt={product.title}
                  className="w-32 h-32 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-[#000000]" style={{ fontFamily: 'Optima, serif' }}>
                    {product.title}
                  </h3>
                  {!product.published && (
                    <span className="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded-full">
                      UNPUBLISHED
                    </span>
                  )}
                  {product.featured && (
                    <span className="px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-600 rounded-full">
                      FEATURED
                    </span>
                  )}
                  {product.retreat_id && (
                    <span className="px-3 py-1 text-xs font-semibold bg-purple-100 text-purple-600 rounded-full">
                      LINKED TO RETREAT
                    </span>
                  )}
                  {product.categories?.includes('past-retreat') && (
                    <span className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-600 rounded-full">
                      PAST RETREAT
                    </span>
                  )}
                </div>
                <p className="text-[#717680] mb-2" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                  Type: <span className="capitalize">{product.type.replace('_', ' ')}</span>
                </p>
                <div className="flex items-center gap-2 text-sm text-[#717680]">
                  <DollarSign className="w-4 h-4" />
                  <span style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                    ${product.price.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => window.open(`/store/${product.slug}`, '_blank')}
                  variant="outline"
                  size="sm"
                  title="View product page"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => setManagingTestimonials(product)}
                  variant="outline"
                  size="sm"
                  title="Manage testimonials"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <MessageSquare className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handleEdit(product)}
                  variant="outline"
                  size="sm"
                  title="Edit product"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handleDelete(product.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Delete product"
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
