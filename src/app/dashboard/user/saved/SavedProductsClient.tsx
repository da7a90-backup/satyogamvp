"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Search, Bookmark, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

// Types
interface Product {
  id: string;
  slug: string;
  title: string;
  price: number;
  thumbnail_url: string | null;
  featured_image: string | null;
  images: string[];
  type: string;
  short_description: string;
  description: string;
  categories: string[];
  tags: string[];
  featured: boolean;
  created_at: string;
}

interface SavedProductsClientProps {
  bookmarks: Product[];
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

export default function SavedProductsClient({ bookmarks: initialBookmarks }: SavedProductsClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { addItem } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarks, setBookmarks] = useState<Product[]>(initialBookmarks);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Filter products based on search query
  const filteredProducts = bookmarks.filter((product) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      product.title.toLowerCase().includes(searchLower) ||
      product.description?.toLowerCase().includes(searchLower) ||
      product.categories?.some((cat) => cat.toLowerCase().includes(searchLower))
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when search changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Go to specific page
  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
        // Remove from bookmarks list if unbookmarked
        if (!data.is_bookmarked) {
          setBookmarks((prev) => prev.filter((p) => p.id !== productId));
        }
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  // Handle add to cart
  const handleAddToCart = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await addItem(productId, 1);
  };

  return (
    <div className="flex flex-col bg-[#FAF8F1] min-h-screen lg:min-h-[125vh]">
      {/* Header Section */}
      <div className="flex flex-col px-8 pt-8 pb-8 border-b border-[#E5E7EB]">
        <div className="flex items-center justify-between gap-4">
          <h1
            className="text-[24px] leading-[32px] font-[550] text-[#181D27]"
            style={{ fontFamily: "Optima, serif" }}
          >
            Saved for later
          </h1>

          {/* Search Input */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#D5D7DA] rounded-lg shadow-sm w-[320px]">
            <Search className="w-5 h-5 text-[#717680]" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearchChange}
              className="flex-1 text-base text-[#717680] outline-none bg-transparent"
              style={{ fontFamily: "Avenir Next, sans-serif" }}
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
        <div className="flex flex-col gap-2">
          <h2
            className="text-xl leading-7 font-semibold text-[#181D27]"
            style={{ fontFamily: "Avenir Next, sans-serif" }}
          >
            Saved for later
          </h2>
          <p
            className="text-base leading-6 text-[#414651]"
            style={{ fontFamily: "Avenir Next, sans-serif" }}
          >
            Revisit products you have saved previously
          </p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
              <Bookmark size={32} className="text-[#717680]" />
            </div>
            <h2 className="text-2xl font-bold text-[#000000] mb-2">
              {searchQuery ? 'No products found' : 'No saved products yet'}
            </h2>
            <p className="text-[#717680] text-center max-w-md mb-8">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Start saving products to easily find them later'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => router.push('/dashboard/user/dharma-bandhara')}
                className="px-6 py-3 bg-[#7D1A13] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
              >
                Browse Store
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Items count */}
            <div className="flex items-center justify-between">
              <p
                className="text-lg font-semibold text-[#111927]"
                style={{ fontFamily: "Avenir Next, sans-serif" }}
              >
                <span className="font-semibold">{filteredProducts.length}</span> {filteredProducts.length === 1 ? 'item' : 'items'}
              </p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProducts.map((product) => {
                const image = product.featured_image || product.thumbnail_url || product.images?.[0] || '/placeholder-image.jpg';

                return (
                  <div
                    key={product.id}
                    className="group bg-white rounded-lg overflow-hidden hover:shadow-xl transition-all relative flex flex-col h-[500px]"
                    style={{ border: '1px solid #D5D7DA' }}
                  >
                    <div
                      className="relative bg-[#E4DBCD] overflow-hidden cursor-pointer h-[260px]"
                      onClick={() => router.push(`/dashboard/user/dharma-bandhara/${product.slug}`)}
                    >
                      {image !== '/placeholder-image.jpg' ? (
                        <Image
                          src={image}
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
                        <Bookmark className="w-4 h-4 text-white" fill="#7D1A13" stroke="#7D1A13" />
                      </button>

                      {/* Type Badges */}
                      <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                        {getTypeBadges(product.type).map((badge, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-black/80 text-white text-xs font-semibold rounded"
                          >
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
                );
              })}
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
                  <span className="text-sm font-semibold" style={{ fontFamily: "Avenir Next, sans-serif" }}>
                    Previous
                  </span>
                </button>

                {/* Page Numbers */}
                <div className="flex gap-0.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-colors ${
                        currentPage === page
                          ? "bg-[#FAFAFA] text-[#252B37]"
                          : "text-[#535862] hover:bg-[#FAFAFA]"
                      }`}
                      style={{ fontFamily: "Avenir Next, sans-serif" }}
                    >
                      {page}
                    </button>
                  ))}
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
    </div>
  );
}
