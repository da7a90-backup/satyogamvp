"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Search, Bookmark, Filter, ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

// Types
interface Product {
  id: string;
  slug: string;
  title: string;
  price: number;
  image: string;
  type: string;
  short_description: string;
  description: string;
  categories: string[];
  tags: string[];
  featured: boolean;
  created_at: string;
}

interface PageContent {
  eyebrow: string;
  title: string;
  description: string;
}

interface DashboardStoreClientProps {
  initialProducts: Product[];
  initialCategories: string[];
  pageContent: PageContent;
}

const CATEGORIES = [
  'All products',
  'Past online retreats',
  'Book group',
  'Ebooks',
  'Shunyamurti reads',
  'Guided meditations',
  'Courses',
];

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

// Modal Component for action messages
function ActionModal({ isOpen, onClose, message }: { isOpen: boolean; onClose: () => void; message: string }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-[#942017]/10 rounded-full flex items-center justify-center mx-auto">
              <Bookmark className="w-8 h-8 text-[#942017]" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">Feature Under Development</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <Button onClick={onClose} className="w-full bg-[#942017] hover:bg-[#942017]/90 text-white">
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardStoreClient({
  initialProducts,
  initialCategories,
  pageContent,
}: DashboardStoreClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { addItem } = useCart();
  const [products] = useState<Product[]>(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState("All products");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'created_at' | 'price' | 'name'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const itemsPerPage = 12;

  // Load bookmarks on mount
  useEffect(() => {
    const loadBookmarks = async () => {
      if (!session?.user?.accessToken) return;

      try {
        const FASTAPI_URL = process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || "http://127.0.0.1:8000";
        const response = await fetch(`${FASTAPI_URL}/api/products/bookmarks/list`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.user.accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const bookmarkIds = new Set(data.bookmarks?.map((b: any) => b.id) || []);
          setBookmarks(bookmarkIds);
        }
      } catch (error) {
        console.error("Error loading bookmarks:", error);
      }
    };

    loadBookmarks();
  }, [session]);

  // Toggle bookmark
  const toggleBookmark = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!session?.user?.accessToken) return;

    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || "http://127.0.0.1:8000";

      const response = await fetch(`${FASTAPI_URL}/api/products/${productId}/bookmark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.user.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBookmarks((prev) => {
          const newBookmarks = new Set(prev);
          if (data.is_bookmarked) {
            newBookmarks.add(productId);
          } else {
            newBookmarks.delete(productId);
          }
          return newBookmarks;
        });
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory !== 'All products') {
      if (selectedCategory === 'Past online retreats') {
        filtered = filtered.filter(p => p.type === 'RETREAT_PORTAL_ACCESS');
      } else if (selectedCategory === 'Ebooks') {
        filtered = filtered.filter(p => p.type === 'EBOOK');
      } else if (selectedCategory === 'Guided meditations') {
        filtered = filtered.filter(p =>
          p.type === 'GUIDED_MEDITATION' ||
          (p.categories && p.categories.some((cat: string) => cat.toLowerCase().includes('guided meditation')))
        );
      } else if (selectedCategory === 'Shunyamurti reads') {
        filtered = filtered.filter(p =>
          p.categories && p.categories.some((cat: string) => cat.toLowerCase().includes('shunyamurti read'))
        );
      } else if (selectedCategory === 'Book group') {
        filtered = filtered.filter(p =>
          p.categories && p.categories.some((cat: string) => cat.toLowerCase().includes('book group'))
        );
      } else if (selectedCategory === 'Courses') {
        filtered = filtered.filter(p =>
          p.categories && p.categories.some((cat: string) => cat.toLowerCase().includes('course'))
        );
      }
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
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
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        const diff = dateA - dateB;
        return sortOrder === 'asc' ? diff : -diff;
      }
    });

    return filtered;
  }, [products, selectedCategory, searchQuery, sortBy, sortOrder]);

  // Paginate products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedProducts, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);

  // Featured product
  const featuredProduct = selectedCategory === "All products"
    ? products.find((product) => product.featured) || products[0]
    : filteredAndSortedProducts[0];

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleAddToCart = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await addItem(productId, 1);
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
    <div className="flex flex-col bg-[#FAF8F1] min-h-screen lg:min-h-[125vh]">
      {/* Header Section */}
      <div className="flex flex-col px-8 pt-8 pb-8 border-b border-[#E5E7EB]">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-optima text-2xl font-semibold text-[#181D27]">
            Store
          </h1>

          {/* Search Input */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#D5D7DA] rounded-lg shadow-sm w-full sm:w-80 lg:w-96">
            <Search className="w-5 h-5 text-[#717680]" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearch}
              className="flex-1 text-base text-[#717680] outline-none bg-transparent font-avenir"
            />
            <div className="px-1 py-0.5 border border-[#E9EAEB] rounded text-xs text-[#717680] mix-blend-multiply">
              ⌘K
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col p-8 gap-6">
        {/* Page Content Section */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="font-avenir text-xl leading-7 font-semibold text-[#181D27]">
              {pageContent.title}
            </h2>
            <p className="font-avenir text-base leading-6 text-[#414651]">
              {pageContent.description}
            </p>
          </div>

          {/* Featured Product */}
          {featuredProduct && selectedCategory === "All products" && (
            <div className="relative flex flex-col md:flex-row w-full bg-white border border-[#D2D6DB] rounded-lg overflow-hidden">
              {/* Image Section */}
              <div
                className="relative w-full md:w-[560px] h-[240px] md:h-[322px] flex-shrink-0 cursor-pointer bg-gray-100"
                onClick={() => router.push(`/dashboard/user/dharma-bandhara/${featuredProduct.slug}`)}
              >
                {featuredProduct.image ? (
                  <Image
                    src={featuredProduct.image}
                    alt={featuredProduct.title}
                    fill
                    className="object-cover"
                    priority
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <svg className="h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}

                {/* Featured Badge */}
                <div className="absolute left-[18px] top-[20px] z-10">
                  <span className="font-avenir inline-flex items-center px-[10px] py-1 rounded-lg text-sm font-medium bg-white border border-[#D5D7DA] shadow-sm text-[#414651]">
                    Featured
                  </span>
                </div>

                {/* Bookmark Icon */}
                <button
                  onClick={(e) => toggleBookmark(featuredProduct.id, e)}
                  className="absolute top-0 right-0 w-20 h-20 flex items-center justify-center z-10"
                  aria-label="Bookmark"
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                    <Bookmark
                      className="w-4 h-4 text-white"
                      fill={bookmarks.has(featuredProduct.id) ? "#7D1A13" : "none"}
                      stroke={bookmarks.has(featuredProduct.id) ? "#7D1A13" : "currentColor"}
                    />
                  </div>
                </button>
              </div>

              {/* Content Section */}
              <div className="flex flex-col justify-between p-6 md:p-12 flex-1">
                <div className="flex flex-col gap-4 w-full">
                  {/* Type Badge */}
                  <div>
                    <span className="font-avenir text-sm font-semibold text-black">
                      {getTypeBadges(featuredProduct.type)[0]}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="font-optima text-3xl md:text-4xl font-bold leading-tight md:leading-[44px] text-black w-full tracking-tight">
                    {featuredProduct.title}
                  </h2>

                  {/* Description */}
                  <p className="font-avenir text-base leading-6 text-[#414651] w-full">
                    {featuredProduct.short_description || featuredProduct.description}
                  </p>
                </div>

                {/* Price and Button */}
                <div className="flex items-center justify-between w-full">
                  <span
                    style={{
                      fontFamily: 'Roboto',
                      fontSize: '20px',
                      fontWeight: 600,
                      lineHeight: '150%',
                      color: '#000000'
                    }}
                  >
                    ${Number(featuredProduct.price).toFixed(2)}
                  </span>
                  <button
                    onClick={(e) => handleAddToCart(featuredProduct.id, e)}
                    className="font-avenir inline-flex items-center justify-center px-4 py-[10px] text-base font-semibold text-white rounded-lg w-full md:w-fit bg-[#7D1A13] shadow-[0px_1px_2px_rgba(16,24,40,0.05),inset_0px_0px_0px_1px_rgba(10,13,18,0.18),inset_0px_-2px_0px_rgba(10,13,18,0.05)] hover:shadow-lg transition-all"
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Products List Section */}
        <div className="flex flex-col gap-6 pt-8">
          {/* Category Tabs */}
          <div className="flex items-center justify-between border-b border-[#E9EAEB]">
            <div className="flex items-center gap-3 overflow-x-auto pb-px">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`font-avenir px-1 pb-3 text-sm font-semibold whitespace-nowrap ${
                    selectedCategory === category
                      ? "border-b-2 border-[#7D1A13] text-[#7D1A13]"
                      : "text-[#717680]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Item count and Sort */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <span className="font-avenir text-xs font-semibold text-[#111927]">
              {filteredAndSortedProducts.length} items
            </span>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
                setCurrentPage(1);
              }}
              className="font-avenir px-4 py-2 border border-[#D5D7DA] rounded-lg text-sm bg-white shadow-sm font-semibold text-[#414651]"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all relative flex flex-col border border-[#D5D7DA]"
              >
                <div
                  className="relative bg-[#E4DBCD] overflow-hidden cursor-pointer h-[200px] sm:h-[240px] md:h-[260px]"
                  onClick={() => router.push(`/dashboard/user/dharma-bandhara/${product.slug}`)}
                >
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                  <button
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors backdrop-blur-sm"
                    onClick={(e) => toggleBookmark(product.id, e)}
                  >
                    <Bookmark
                      className="w-4 h-4 text-white"
                      fill={bookmarks.has(product.id) ? "#7D1A13" : "none"}
                      stroke={bookmarks.has(product.id) ? "#7D1A13" : "white"}
                    />
                  </button>
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    {getTypeBadges(product.type).map((badge, index) => (
                      <span key={index} className="bg-[#525252]/60 backdrop-blur-sm text-white px-2 py-1 text-[10px] font-medium rounded">
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <p className="text-sm font-bold text-[#942017] mb-1 uppercase tracking-wide">
                    {product.categories && product.categories.length > 0 ? product.categories[0] : getTypeBadges(product.type).join(' & ')}
                  </p>
                  <h3
                    className="font-semibold text-lg mb-3 line-clamp-2 group-hover:text-[#942017] transition-colors leading-tight cursor-pointer"
                    onClick={() => router.push(`/dashboard/user/dharma-bandhara/${product.slug}`)}
                  >
                    {product.title}
                  </h3>
                  <div className="mt-auto">
                    <p className="text-xl font-semibold mb-3">${Number(product.price).toFixed(2)}</p>
                    <Button
                      size="sm"
                      onClick={(e) => handleAddToCart(product.id, e)}
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
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-5 border-t border-[#E9EAEB]">
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
              <span className="font-avenir text-sm font-semibold">
                Previous
              </span>
            </button>

            {/* Page Numbers */}
            <div className="flex gap-0.5">
              {(() => {
                const pages = [];
                const showEllipsisStart = currentPage > 4;
                const showEllipsisEnd = currentPage < totalPages - 3;

                if (totalPages > 0) {
                  pages.push(
                    <button
                      key={1}
                      onClick={() => goToPage(1)}
                      className={`font-avenir w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium ${
                        currentPage === 1
                          ? "bg-[#FAFAFA] text-[#252B37]"
                          : "text-[#535862] hover:bg-gray-50"
                      }`}
                    >
                      1
                    </button>
                  );
                }

                if (showEllipsisStart) {
                  pages.push(
                    <span key="ellipsis-start" className="w-10 h-10 flex items-center justify-center text-[#535862]">
                      ...
                    </span>
                  );
                }

                const startPage = showEllipsisStart ? Math.max(2, currentPage - 1) : 2;
                const endPage = showEllipsisEnd ? Math.min(totalPages - 1, currentPage + 1) : totalPages - 1;

                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => goToPage(i)}
                      className={`font-avenir w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium ${
                        currentPage === i
                          ? "bg-[#FAFAFA] text-[#252B37]"
                          : "text-[#535862] hover:bg-gray-50"
                      }`}
                    >
                      {i}
                    </button>
                  );
                }

                if (showEllipsisEnd) {
                  pages.push(
                    <span key="ellipsis-end" className="w-10 h-10 flex items-center justify-center text-[#535862]">
                      ...
                    </span>
                  );
                }

                if (totalPages > 1) {
                  pages.push(
                    <button
                      key={totalPages}
                      onClick={() => goToPage(totalPages)}
                      className={`font-avenir w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium ${
                        currentPage === totalPages
                          ? "bg-[#FAFAFA] text-[#252B37]"
                          : "text-[#535862] hover:bg-gray-50"
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
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg border shadow-sm ${
                currentPage === totalPages
                  ? "bg-white border-[#D5D7DA] text-[#414651] cursor-not-allowed opacity-50"
                  : "bg-white border-[#D5D7DA] text-[#414651] hover:bg-gray-50"
              }`}
            >
              <span className="font-avenir text-sm font-semibold">
                Next
              </span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
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
