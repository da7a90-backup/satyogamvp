'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { ChevronLeft, ChevronDown, Bookmark, X } from 'lucide-react';
import TestimonialCarouselTertiary from '@/components/shared/TestimonialTertiary';
import { useCart } from '@/contexts/CartContext';

// Modal Component
function ActionModal({ isOpen, onClose, message }: { isOpen: boolean; onClose: () => void; message: string }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
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
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-[#942017]">
                <path d="M9 2L9 6M15 2L15 6M3 10L21 10M5 4L19 4C20.1046 4 21 4.89543 21 6L21 20C21 21.1046 20.1046 22 19 22L5 22C3.89543 22 3 21.1046 3 20L3 6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">Feature Under Development</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#7D1A13] hover:bg-[#7D1A13]/90 text-white font-semibold rounded-lg transition-colors"
            style={{ fontFamily: 'Avenir Next, sans-serif' }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

interface Product {
  id: string;
  slug: string;
  title: string;
  type: string;
  price: number;
  description: string;
  short_description: string;
  regular_price: number;
  sale_price: number | null;
  member_discount: number | null;
  digital_content_url: string | null;
  thumbnail_url: string | null;
  featured_image: string | null;
  images: string[];
  sku: string;
  woo_type: string[];
  downloads: any[];
  categories: string[];
  tags: string[];
  portal_media: {
    youtube: any[];
    vimeo: any[];
    cloudflare: any[];
    mp4: any[];
    mp3: any[];
    pdf_files: any[];
  } | null;
  has_video_category: boolean;
  has_audio_category: boolean;
  product_slug: string | null;
  store_slug: string | null;
  portal_url: string | null;
  is_available: boolean;
  in_stock: boolean;
  stock_quantity: number | null;
  published: boolean;
  featured: boolean;
  weight: string | null;
  allow_reviews: boolean;
  external_url: string | null;
  retreat_id: string | null;
  created_at: string;
  updated_at: string;
}

interface DashboardProductDetailClientProps {
  product: Product;
}

export default function DashboardProductDetailClient({ product }: DashboardProductDetailClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { addItem, toggleDrawer } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isMember, setIsMember] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [expandedAccordion, setExpandedAccordion] = useState<number | null>(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Check if product is bookmarked on mount
  useEffect(() => {
    const checkBookmark = async () => {
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
          const bookmarkIds = data.bookmarks?.map((b: any) => b.id) || [];
          setIsBookmarked(bookmarkIds.includes(product.id));
        }
      } catch (error) {
        console.error("Error checking bookmark:", error);
      }
    };

    checkBookmark();
  }, [session, product.id]);

  // Toggle bookmark
  const toggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user?.accessToken) {
      handleAction('Please sign in to save products for later');
      return;
    }

    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || "http://127.0.0.1:8000";

      const response = await fetch(`${FASTAPI_URL}/api/products/${product.id}/bookmark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.user.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsBookmarked(data.is_bookmarked);
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      handleAction('Failed to save product. Please try again.');
    }
  };

  const handleAction = (message: string) => {
    setModalMessage(message);
    setModalOpen(true);
  };

  // Handle Add to Cart
  const handleAddToCart = async () => {
    await addItem(product.id, 1);
  };

  // Handle Buy Now
  const handleBuyNow = async () => {
    // Navigate directly to product payment page (like courses/retreats)
    router.push(`/dashboard/user/dharma-bandhara/${product.slug}/payment`);
  };

  // Prepare images array
  const images = product.images && product.images.length > 0
    ? product.images
    : product.featured_image
    ? [product.featured_image]
    : ['/placeholder-image.jpg'];

  // Mock testimonials data
  const testimonialsData = {
    tagline: "TESTIMONIALS",
    heading: "What Our Community Says",
    testimonials: [
      {
        quote: "This retreat completely transformed my understanding of consciousness and opened new pathways to inner peace.",
        name: "Sarah Mitchell",
        location: "California, USA",
        avatar: "https://imagedelivery.net/5qGjs10y-85hdb5ied9uLw/882a363c-ac1b-40c6-7d7e-c7132b00b200/public"
      },
      {
        quote: "Shunyamurti's teachings are profound yet accessible. This content is an invaluable resource for anyone on the spiritual path.",
        name: "David Chen",
        location: "Toronto, Canada",
        avatar: "https://imagedelivery.net/5qGjs10y-85hdb5ied9uLw/882a363c-ac1b-40c6-7d7e-c7132b00b200/public"
      },
      {
        quote: "The depth and clarity of these teachings have profoundly impacted my daily practice and understanding.",
        name: "Maria Rodriguez",
        location: "Madrid, Spain",
        avatar: "https://imagedelivery.net/5qGjs10y-85hdb5ied9uLw/882a363c-ac1b-40c6-7d7e-c7132b00b200/public"
      },
      {
        quote: "An incredible journey through wisdom that has stayed with me long after completing the retreat.",
        name: "James Wilson",
        location: "London, UK",
        avatar: "https://imagedelivery.net/5qGjs10y-85hdb5ied9uLw/882a363c-ac1b-40c6-7d7e-c7132b00b200/public"
      },
      {
        quote: "Every session brought new insights and revelations. The guided meditations were particularly powerful.",
        name: "Emma Thompson",
        location: "Sydney, Australia",
        avatar: "https://imagedelivery.net/5qGjs10y-85hdb5ied9uLw/882a363c-ac1b-40c6-7d7e-c7132b00b200/public"
      },
      {
        quote: "A life-changing experience that continues to guide my spiritual journey every single day.",
        name: "Michael Brown",
        location: "New York, USA",
        avatar: "https://imagedelivery.net/5qGjs10y-85hdb5ied9uLw/882a363c-ac1b-40c6-7d7e-c7132b00b200/public"
      }
    ]
  };

  return (
    <>
      <div className="flex flex-col bg-[#FAF8F1] min-h-screen">
        {/* Header */}
        <div className="flex flex-col px-8 pt-8 pb-6 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard/user/dharma-bandhara')}
              className="flex items-center gap-2 text-[#7D1A13] hover:text-[#7D1A13]/80 transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <ChevronLeft className="w-6 h-6" />
              <span className="text-base font-bold">Back</span>
            </button>
          </div>
        </div>

        {/* Product Content */}
        <div className="flex flex-col px-8 py-8 gap-6">
          <div className="flex flex-col lg:flex-row items-start w-full gap-12">
            {/* Left: Image Gallery */}
            <div className="flex flex-col lg:flex-row items-start gap-4 w-full lg:w-auto flex-shrink-0">
              {/* Thumbnail Column (Desktop) */}
              <div className="hidden lg:flex flex-col gap-4">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-25 rounded-lg overflow-hidden transition-opacity ${
                      selectedImage === index ? 'opacity-100 ring-2 ring-[#7D1A13]' : 'opacity-60 hover:opacity-80'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.title} thumbnail ${index + 1}`}
                      width={80}
                      height={100}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </button>
                ))}
              </div>

              {/* Main Image */}
              <div className="relative w-full lg:w-[520px] h-[400px] lg:h-[640px] rounded-lg overflow-hidden bg-gray-200">
                <Image
                  src={images[selectedImage]}
                  alt={product.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {/* Bookmark Icon */}
                <button
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors backdrop-blur-sm"
                  onClick={toggleBookmark}
                >
                  <Bookmark
                    className="w-4 h-4 text-white"
                    fill={isBookmarked ? "#7D1A13" : "none"}
                    stroke={isBookmarked ? "#7D1A13" : "currentColor"}
                  />
                </button>
              </div>

              {/* Mobile Thumbnails */}
              <div className="flex lg:hidden gap-3 overflow-x-auto w-full">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-25 rounded-lg overflow-hidden ${
                      selectedImage === index ? 'ring-2 ring-[#7D1A13]' : ''
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      width={80}
                      height={100}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="flex-1 w-full flex flex-col gap-8">
              {/* Product Name */}
              <div className="flex flex-col gap-2">
                <h1
                  className="text-5xl font-medium leading-tight"
                  style={{
                    fontFamily: 'Optima, Georgia, serif',
                    fontWeight: 550,
                    letterSpacing: '-0.02em'
                  }}
                >
                  {product.title}
                </h1>
              </div>

              {/* Price */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                  <span
                    className="text-5xl font-bold leading-tight"
                    style={{
                      fontFamily: 'Optima, Georgia, serif',
                      letterSpacing: '-0.02em'
                    }}
                  >
                    ${isMember && product.member_discount ?
                      (Number(product.price) * (1 - product.member_discount / 100)).toFixed(0) :
                      Number(product.price).toFixed(0)}
                  </span>
                </div>
                {isMember && product.member_discount && (
                  <div className="flex items-center gap-2">
                    <span
                      className="text-lg line-through text-gray-500"
                      style={{ fontFamily: 'Avenir Next, sans-serif' }}
                    >
                      ${Number(product.price).toFixed(0)}
                    </span>
                    <span
                      className="px-2 py-1 rounded text-sm font-semibold bg-[#FEF3F2] text-[#7D1A13]"
                      style={{ fontFamily: 'Avenir Next, sans-serif' }}
                    >
                      {product.member_discount}% Member Discount
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              {(product.short_description || product.description) && (
                <div
                  className="text-base leading-relaxed text-[#414651]"
                  style={{ fontFamily: 'Avenir Next, sans-serif' }}
                  dangerouslySetInnerHTML={{
                    __html: product.short_description || product.description || ''
                  }}
                />
              )}

              {/* Form */}
              <div className="flex flex-col gap-6">
                {/* Quantity - Fixed to 1 */}
                <div className="flex flex-col gap-2">
                  <label
                    className="text-sm font-medium text-[#414651]"
                    style={{ fontFamily: 'Avenir Next, sans-serif' }}
                  >
                    Quantity
                  </label>
                  <div
                    className="px-4 py-3 border border-[#D5D7DA] rounded-lg bg-gray-50 text-gray-500"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      boxShadow: '0px 1px 2px rgba(10, 13, 18, 0.05)'
                    }}
                  >
                    1
                  </div>
                </div>

                {/* Are you a member */}
                <div className="flex flex-col gap-2">
                  <label
                    className="text-sm font-medium text-[#414651]"
                    style={{ fontFamily: 'Avenir Next, sans-serif' }}
                  >
                    Are you a member?*
                  </label>
                  <select
                    value={isMember}
                    onChange={(e) => setIsMember(e.target.value)}
                    className="px-4 py-3 border border-[#D5D7DA] rounded-lg bg-white appearance-none"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '16px',
                      color: isMember ? '#000000' : '#717680',
                      boxShadow: '0px 1px 2px rgba(10, 13, 18, 0.05)',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5 7.5L10 12.5L15 7.5' stroke='%23A4A7AE' stroke-width='1.67' stroke-linecap='round'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 14px center'
                    }}
                  >
                    <option value="">Select an option ...</option>
                    <option value="yes">Yes, I am a member</option>
                    <option value="no">No, I am not a member</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-4">
                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  className="w-full py-3 px-5 flex items-center justify-center rounded-lg font-semibold text-white transition-colors bg-[#7D1A13] hover:bg-[#7D1A13]/90"
                  style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '16px',
                    boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05), inset 0px 0px 0px 1px rgba(10, 13, 18, 0.18), inset 0px -2px 0px rgba(10, 13, 18, 0.05)'
                  }}
                >
                  Add to cart
                </button>

                {/* Buy Now */}
                <button
                  onClick={handleBuyNow}
                  className="w-full py-3 px-5 flex items-center justify-center rounded-lg font-semibold border border-[#D5D7DA] bg-white transition-colors hover:bg-gray-50 text-[#414651]"
                  style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '16px',
                    boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05), inset 0px 0px 0px 1px rgba(10, 13, 18, 0.18), inset 0px -2px 0px rgba(10, 13, 18, 0.05)'
                  }}
                >
                  Buy now
                </button>

                {/* Membership Link */}
                <p
                  className="text-center text-sm text-[#414651]"
                  style={{ fontFamily: 'Avenir Next, sans-serif' }}
                >
                  Discover our memberships to receive discounts
                </p>
              </div>

              {/* Accordions */}
              <div className="flex flex-col border-t border-b border-black">
                {/* Accordion 1: Package Includes - Only for Retreat Packages */}
                {product.type === 'RETREAT_PORTAL_ACCESS' && product.portal_media && (
                  <div className="border-t border-black">
                    <button
                      onClick={() => setExpandedAccordion(expandedAccordion === 0 ? null : 0)}
                      className="w-full flex items-center justify-between py-4"
                    >
                      <h3
                        className="text-lg font-bold text-left"
                        style={{ fontFamily: 'Avenir Next, sans-serif' }}
                      >
                        This complete retreat package includes:
                      </h3>
                      <ChevronDown
                        className={`w-6 h-6 transition-transform ${
                          expandedAccordion === 0 ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {expandedAccordion === 0 && (
                      <div className="pb-6">
                        <ul
                          className="space-y-2 text-base text-[#414651]"
                          style={{ fontFamily: 'Avenir Next, sans-serif' }}
                        >
                          {/* Audio Files */}
                          {product.portal_media.mp3 && product.portal_media.mp3.length > 0 && (
                            <li>• {product.portal_media.mp3.length} Audio File{product.portal_media.mp3.length > 1 ? 's' : ''}</li>
                          )}

                          {/* Video Files (MP4) */}
                          {product.portal_media.mp4 && product.portal_media.mp4.length > 0 && (
                            <li>• {product.portal_media.mp4.length} Downloadable Video{product.portal_media.mp4.length > 1 ? 's' : ''}</li>
                          )}

                          {/* Streaming Videos (YouTube + Vimeo + Cloudflare) */}
                          {(() => {
                            const totalStreaming =
                              (product.portal_media.youtube?.length || 0) +
                              (product.portal_media.vimeo?.length || 0) +
                              (product.portal_media.cloudflare?.length || 0);

                            if (totalStreaming > 0) {
                              return <li>• {totalStreaming} Streaming Video{totalStreaming > 1 ? 's' : ''}</li>;
                            }
                            return null;
                          })()}

                          {/* PDF Files */}
                          {product.portal_media.pdf_files && product.portal_media.pdf_files.length > 0 && (
                            <li>• {product.portal_media.pdf_files.length} PDF Document{product.portal_media.pdf_files.length > 1 ? 's' : ''}</li>
                          )}

                          {/* Lifetime Access Note */}
                          <li className="mt-3 text-[#7D1A13] font-semibold">• Lifetime Access to All Content</li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Accordion 2: Table of Contents - Only for Retreat Packages with portal media */}
                {product.type === 'RETREAT_PORTAL_ACCESS' && product.portal_media &&
                 (product.portal_media.youtube?.length > 0 || product.portal_media.vimeo?.length > 0 ||
                  product.portal_media.cloudflare?.length > 0 || product.portal_media.mp3?.length > 0 ||
                  product.portal_media.mp4?.length > 0) && (
                  <div className="border-t border-black">
                    <button
                      onClick={() => setExpandedAccordion(expandedAccordion === 1 ? null : 1)}
                      className="w-full flex items-center justify-between py-4"
                    >
                      <h3
                        className="text-lg font-bold text-left"
                        style={{ fontFamily: 'Avenir Next, sans-serif' }}
                      >
                        Table of Contents:
                      </h3>
                      <ChevronDown
                        className={`w-6 h-6 transition-transform ${
                          expandedAccordion === 1 ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {expandedAccordion === 1 && (
                      <div className="pb-6">
                        <ul
                          className="space-y-2 text-base text-[#414651]"
                          style={{ fontFamily: 'Avenir Next, sans-serif' }}
                        >
                          {/* Show YouTube/Vimeo/Cloudflare videos */}
                          {product.portal_media.youtube?.map((video: any, index: number) => (
                            <li key={`yt-${index}`}>
                              • {video.title || `Video ${index + 1}`}
                              {video.duration && ` [${video.duration}]`}
                            </li>
                          ))}
                          {product.portal_media.vimeo?.map((video: any, index: number) => (
                            <li key={`vm-${index}`}>
                              • {video.title || `Video ${index + 1}`}
                              {video.duration && ` [${video.duration}]`}
                            </li>
                          ))}
                          {product.portal_media.cloudflare?.map((video: any, index: number) => (
                            <li key={`cf-${index}`}>
                              • {video.title || `Video ${index + 1}`}
                              {video.duration && ` [${video.duration}]`}
                            </li>
                          ))}

                          {/* Show MP3 audio files */}
                          {product.portal_media.mp3?.map((audio: any, index: number) => (
                            <li key={`mp3-${index}`}>
                              • {audio.title || `Audio ${index + 1}`}
                              {audio.duration && ` [${audio.duration}]`}
                            </li>
                          ))}

                          {/* If no titles available, show generic count */}
                          {!product.portal_media.youtube?.length &&
                           !product.portal_media.vimeo?.length &&
                           !product.portal_media.cloudflare?.length &&
                           !product.portal_media.mp3?.length && (
                            <li className="text-gray-600">Content listing coming soon</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <TestimonialCarouselTertiary data={testimonialsData} />

      {/* Action Modal */}
      <ActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        message={modalMessage}
      />
    </>
  );
}
