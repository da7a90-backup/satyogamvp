'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { productsApi, type Product } from '@/lib/store-api';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart, ChevronLeft, ChevronRight, X } from 'lucide-react';

const CATEGORIES = [
  'All products',
  'Past online retreats',
  'Book group',
  'Ebooks',
  'Shunyamurti reads',
  'Guided meditations',
  'Courses',
];

const ITEMS_PER_PAGE = 12;

// Modal Component
function ActionModal({ isOpen, onClose, message }: { isOpen: boolean; onClose: () => void; message: string }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-[#942017]/10 rounded-full flex items-center justify-center mx-auto">
              <ShoppingCart className="w-8 h-8 text-[#942017]" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">Feature Under Development</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <Button
            onClick={onClose}
            className="w-full bg-[#942017] hover:bg-[#942017]/90 text-white"
          >
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}

// Get badge labels based on product type (returns array for multiple badges)
function getTypeBadges(type: string): string[] {
  const typeMap: Record<string, string[]> = {
    'AUDIO': ['Audio'],
    'VIDEO': ['Video'],
    'AUDIO_VIDEO': ['Audio', 'Video'],
    'AUDIO_VIDEO_TEXT': ['Audio', 'Video', 'Text'],
    'RETREAT_PORTAL_ACCESS': ['Audio', 'Video'],
    'PHYSICAL': ['Audio'],
    'EBOOK': ['Text'],
    'GUIDED_MEDITATION': ['Audio'],
    'COLLECTION': ['Audio', 'Video'],
  };
  return typeMap[type] || ['Audio', 'Video'];
}

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProduct, setFeaturedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All products');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'created_at' | 'price' | 'name'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Load ALL products (no limit)
      const data = await productsApi.getProducts({ limit: 1000 });
      setProducts(data);

      // Find featured product
      const featured = data.find((p: Product) => p.featured);
      setFeaturedProduct(featured || null);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory !== 'All products') {
      if (selectedCategory === 'Past online retreats') {
        // Filter by type for retreats
        filtered = filtered.filter(p => p.type === 'RETREAT_PORTAL_ACCESS');
      } else if (selectedCategory === 'Ebooks') {
        // Filter by type for ebooks
        filtered = filtered.filter(p => p.type === 'EBOOK');
      } else if (selectedCategory === 'Guided meditations') {
        // Filter by type or category
        filtered = filtered.filter(p =>
          p.type === 'GUIDED_MEDITATION' ||
          (p.categories && p.categories.some((cat: string) => cat.toLowerCase().includes('guided meditation')))
        );
      } else if (selectedCategory === 'Shunyamurti reads') {
        // Filter by category
        filtered = filtered.filter(p =>
          p.categories && p.categories.some((cat: string) => cat.toLowerCase().includes('shunyamurti read'))
        );
      } else if (selectedCategory === 'Book group') {
        // Filter by category
        filtered = filtered.filter(p =>
          p.categories && p.categories.some((cat: string) => cat.toLowerCase().includes('book group'))
        );
      } else if (selectedCategory === 'Courses') {
        // Filter by category
        filtered = filtered.filter(p =>
          p.categories && p.categories.some((cat: string) => cat.toLowerCase().includes('course'))
        );
      }
    }

    // Sort products
    filtered.sort((a, b) => {
      if (sortBy === 'price') {
        const diff = Number(a.price) - Number(b.price);
        return sortOrder === 'asc' ? diff : -diff;
      } else if (sortBy === 'name') {
        const comparison = a.title.localeCompare(b.title);
        return sortOrder === 'asc' ? comparison : -comparison;
      } else {
        // created_at
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        const diff = dateA - dateB;
        return sortOrder === 'asc' ? diff : -diff;
      }
    });

    return filtered;
  }, [products, selectedCategory, sortBy, sortOrder]);

  // Paginate products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedProducts, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / ITEMS_PER_PAGE);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to page 1 when category changes
  };

  const handleAction = (message: string) => {
    setModalMessage(message);
    setModalOpen(true);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F1E8' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-sm tracking-[0.2em] text-[#8B7355] mb-4">STORE</p>
          <h1 className="text-4xl md:text-5xl font-serif mb-4">The Dharma Bandhara</h1>
          <p className="w-full text-gray-700 leading-relaxed">
            The Sat Yoga Online Store is a treasure trove of life-altering knowledge, in the form of unrepeatable retreats,
            paradigm-shifting books, beautiful guided meditations, as well as the popular Reading the Sages audio collections.
          </p>
        </div>

        {/* Featured Product */}
        {featuredProduct && (
          <div
            className="mb-12 mx-auto overflow-hidden bg-white flex flex-row items-center"
            style={{
              width: '923px',
              maxWidth: '100%',
              height: '337px',
              borderRadius: '8px',
              border: '1px solid #D2D6DB',
              boxShadow: '0px 1px 3px rgba(16, 24, 40, 0.1)'
            }}
          >
            <div className="relative flex-shrink-0" style={{ width: '310px', height: '337px' }}>
              <div className="relative w-full h-full bg-[#E4DBCD]" style={{ borderRadius: '8px 0 0 8px' }}>
                {featuredProduct.featured_image ? (
                  <Image
                    src={featuredProduct.featured_image}
                    alt={featuredProduct.title}
                    fill
                    className="object-cover"
                    style={{ borderRadius: '8px 0 0 8px' }}
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
                <button
                  className="absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-opacity hover:opacity-90"
                  style={{ background: 'rgba(0, 0, 0, 0.1)' }}
                  onClick={() => handleAction('Save for later functionality under active development, try again in a couple of days!')}
                >
                  <Heart className="w-4 h-4 text-white" strokeWidth={1.5} />
                </button>
                <div className="absolute bottom-4 left-2">
                  <span className="bg-white border border-[#D5D7DA] px-3 py-1 text-sm font-medium rounded-lg" style={{ boxShadow: '0px 1px 2px rgba(10, 13, 18, 0.05)' }}>
                    {getTypeBadges(featuredProduct.type)[0]}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center" style={{ width: '613px', padding: '24px', gap: '24px' }}>
              <h2 style={{
                fontFamily: 'Optima',
                fontSize: '24px',
                fontWeight: 700,
                lineHeight: '32px',
                color: '#000000',
                margin: 0
              }}>
                {featuredProduct.title}
              </h2>
              <p style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '18px',
                lineHeight: '28px',
                color: '#414651',
                fontWeight: 500,
                margin: 0,
                flexGrow: 1,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {featuredProduct.short_description || featuredProduct.description}
              </p>
              <div className="flex items-center justify-between w-full" style={{ gap: '16px' }}>
                <span style={{
                  fontFamily: 'Roboto',
                  fontSize: '20px',
                  fontWeight: 600,
                  lineHeight: '150%',
                  color: '#000000'
                }}>
                  ${Number(featuredProduct.price).toFixed(2)}
                </span>
                <button
                  onClick={() => handleAction('Add to cart functionality under active development, try again in a couple of days!')}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '10px 14px',
                    gap: '4px',
                    width: '105px',
                    height: '40px',
                    background: '#FFFFFF',
                    border: '1px solid #D5D7DA',
                    boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05), inset 0px 0px 0px 1px rgba(10, 13, 18, 0.18), inset 0px -2px 0px rgba(10, 13, 18, 0.05)',
                    borderRadius: '8px',
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#414651',
                    cursor: 'pointer'
                  }}
                >
                  Add to cart
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-4 mb-8 border-b border-gray-300 pb-4">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-4 py-2 text-sm transition-colors ${
                selectedCategory === category
                  ? 'text-black border-b-2 border-black font-semibold'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Sort and Count */}
        <div className="flex justify-between items-center mb-8">
          <p className="text-sm text-gray-600">{filteredAndSortedProducts.length} items</p>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
              setCurrentPage(1); // Reset to page 1 on sort change
            }}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm bg-white"
          >
            <option value="created_at-desc">Newest first</option>
            <option value="created_at-asc">Oldest first</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg h-96 animate-pulse" />
            ))}
          </div>
        ) : paginatedProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No products found in this category.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {paginatedProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all relative flex flex-col"
                  style={{ border: '1px solid #D5D7DA' }}
                >
                  <Link href={`/store/${product.slug}`} className="relative aspect-square bg-[#E4DBCD] overflow-hidden">
                    {product.featured_image ? (
                      <Image
                        src={product.featured_image}
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                    <button
                      className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors backdrop-blur-sm"
                      onClick={(e) => {
                        e.preventDefault();
                        handleAction('Save for later functionality under active development, try again in a couple of days!');
                      }}
                    >
                      <Heart className="w-4 h-4 text-white" />
                    </button>
                    <div className="absolute bottom-3 left-3 flex gap-2">
                      {getTypeBadges(product.type).map((badge, index) => (
                        <span key={index} className="bg-[#525252]/60 backdrop-blur-sm text-white px-2 py-1 text-[10px] font-medium rounded">
                          {badge}
                        </span>
                      ))}
                    </div>
                  </Link>
                  <div className="p-4 flex flex-col flex-1">
                    <p className="text-sm font-bold text-[#942017] mb-1 uppercase tracking-wide">
                      {product.categories && product.categories.length > 0 ? product.categories[0] : getTypeBadges(product.type).join(' & ')}
                    </p>
                    <Link href={`/store/${product.slug}`}>
                      <h3 className="font-semibold text-lg mb-3 line-clamp-2 group-hover:text-[#942017] transition-colors leading-tight">
                        {product.title}
                      </h3>
                    </Link>
                    <div className="mt-auto">
                      <p className="text-xl font-semibold mb-3">${Number(product.price).toFixed(2)}</p>
                      <Button
                        size="sm"
                        onClick={() => handleAction('Add to cart functionality under active development, try again in a couple of days!')}
                        className="w-full bg-white hover:bg-gray-50 text-[#414651] border border-[#D5D7DA] shadow-sm font-semibold"
                        style={{ boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05), inset 0px 0px 0px 1px rgba(10, 13, 18, 0.18), inset 0px -2px 0px rgba(10, 13, 18, 0.05)' }}
                      >
                        Add to cart
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-12 pt-5 border-t border-[#E9EAEB]">
                {/* Previous Button */}
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg border shadow-sm ${
                    currentPage === 1
                      ? "bg-white border-[#E9EAEB] text-[#A4A7AE] cursor-not-allowed"
                      : "bg-white border-[#E9EAEB] text-[#A4A7AE] hover:bg-gray-50"
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="text-sm font-semibold" style={{ fontFamily: "Avenir Next, sans-serif" }}>
                    Previous
                  </span>
                </button>

                {/* Page Numbers */}
                <div className="flex gap-0.5">
                  {(() => {
                    const pages = [];
                    const showEllipsisStart = currentPage > 4;
                    const showEllipsisEnd = currentPage < totalPages - 3;

                    // Always show first page
                    if (totalPages > 0) {
                      pages.push(
                        <button
                          key={1}
                          onClick={() => goToPage(1)}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium ${
                            currentPage === 1
                              ? "bg-[#FAFAFA] text-[#252B37]"
                              : "text-[#535862] hover:bg-gray-50"
                          }`}
                          style={{ fontFamily: "Avenir Next, sans-serif" }}
                        >
                          1
                        </button>
                      );
                    }

                    // Show ellipsis after first page if needed
                    if (showEllipsisStart) {
                      pages.push(
                        <span key="ellipsis-start" className="w-10 h-10 flex items-center justify-center text-[#535862]">
                          ...
                        </span>
                      );
                    }

                    // Show pages around current page
                    const startPage = showEllipsisStart ? Math.max(2, currentPage - 1) : 2;
                    const endPage = showEllipsisEnd ? Math.min(totalPages - 1, currentPage + 1) : totalPages - 1;

                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => goToPage(i)}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium ${
                            currentPage === i
                              ? "bg-[#FAFAFA] text-[#252B37]"
                              : "text-[#535862] hover:bg-gray-50"
                          }`}
                          style={{ fontFamily: "Avenir Next, sans-serif" }}
                        >
                          {i}
                        </button>
                      );
                    }

                    // Show ellipsis before last page if needed
                    if (showEllipsisEnd) {
                      pages.push(
                        <span key="ellipsis-end" className="w-10 h-10 flex items-center justify-center text-[#535862]">
                          ...
                        </span>
                      );
                    }

                    // Always show last page if there's more than 1 page
                    if (totalPages > 1) {
                      pages.push(
                        <button
                          key={totalPages}
                          onClick={() => goToPage(totalPages)}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium ${
                            currentPage === totalPages
                              ? "bg-[#FAFAFA] text-[#252B37]"
                              : "text-[#535862] hover:bg-gray-50"
                          }`}
                          style={{ fontFamily: "Avenir Next, sans-serif" }}
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
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg border shadow-sm ${
                    currentPage === totalPages
                      ? "bg-white border-[#D5D7DA] text-[#414651] cursor-not-allowed opacity-50"
                      : "bg-white border-[#D5D7DA] text-[#414651] hover:bg-gray-50"
                  }`}
                >
                  <span className="text-sm font-semibold" style={{ fontFamily: "Avenir Next, sans-serif" }}>
                    Next
                  </span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Action Modal */}
      <ActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        message={modalMessage}
      />
    </div>
  );
}
