'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Calendar, DollarSign, ExternalLink, AlertCircle, Search, CheckCircle, BookOpen, Headphones, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { purchasesApi, PurchaseItem } from '@/lib/store-api';
import { AudioPlayerModal } from '@/components/purchases/AudioPlayerModal';
import { EnhancedEbookViewer } from '@/components/purchases/EnhancedEbookViewer';

const CATEGORIES = [
  'All products',
  'Past online retreats',
  'Book group',
  'Ebooks',
  'Shunyamurti reads',
  'Guided meditations',
  'Courses',
];

export const dynamic = 'force-dynamic';

export default function PurchasesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All products');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [ebookModalOpen, setEbookModalOpen] = useState(false);
  const [audioModalOpen, setAudioModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    if (session?.user?.accessToken) {
      loadPurchases();
    } else {
      setLoading(false);
    }
  }, [session]);

  // Handle Tilopay redirect after payment
  useEffect(() => {
    const handlePaymentRedirect = async () => {
      const code = searchParams.get('code');
      const order = searchParams.get('order');
      const tilopayTransaction = searchParams.get('tilopay-transaction');

      // If redirect params are present, process the payment confirmation
      if (code && order && session?.user?.accessToken) {
        console.log('[PURCHASES] Detected payment redirect:', { code, order, tilopayTransaction });

        if (code === '1') {
          // Payment approved - confirm and grant access
          setProcessingPayment(true);
          setPaymentError(null);

          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/payments/confirm-redirect`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${session.user.accessToken}`,
                },
                body: JSON.stringify({
                  code,
                  order,
                  'tilopay-transaction': tilopayTransaction,
                }),
              }
            );

            if (!response.ok) {
              throw new Error('Failed to confirm payment');
            }

            const result = await response.json();
            console.log('[PURCHASES] Payment confirmed:', result);

            // Wait a moment for DB to update, then reload purchases
            setTimeout(() => {
              loadPurchases();
              setProcessingPayment(false);

              // Clear URL parameters
              router.replace('/dashboard/user/purchases', { scroll: false });
            }, 1000);

          } catch (error: any) {
            console.error('[PURCHASES] Error confirming payment:', error);
            setPaymentError(error.message || 'Failed to process payment confirmation');
            setProcessingPayment(false);

            // Still try to load purchases after error
            setTimeout(() => {
              loadPurchases();
              // Clear URL parameters
              router.replace('/dashboard/user/purchases', { scroll: false });
            }, 2000);
          }
        } else {
          // Payment failed
          setPaymentError('Payment was not approved. Please try again.');
          setProcessingPayment(false);

          // Clear URL parameters after showing error
          setTimeout(() => {
            router.replace('/dashboard/user/purchases', { scroll: false });
          }, 3000);
        }
      }
    };

    handlePaymentRedirect();
  }, [searchParams, session, router]);

  const loadPurchases = async () => {
    if (!session?.user?.accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await purchasesApi.getMyPurchases(session.user.accessToken);
      console.log('[PURCHASES] Loaded purchases:', data);
      data.forEach((p: any, i: number) => {
        console.log(`[PURCHASE ${i+1}] ${p.product.title}:`, {
          has_portal_media: !!p.product.portal_media,
          portal_media: p.product.portal_media,
          retreat_slug: p.product.retreat_slug,
          retreat_id: p.product.retreat_id,
          is_expired: p.is_expired
        });
      });
      setPurchases(data);
    } catch (error) {
      console.error('Failed to load purchases:', error);
      // Don't throw error to user, just show empty state
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  const hasPortalMedia = (product: any) => {
    if (!product.portal_media) return false;

    // Handle list format (guided meditations, audio products)
    if (Array.isArray(product.portal_media)) {
      return product.portal_media.length > 0;
    }

    // Handle dict format (retreat packages)
    const result = !!(
      product.portal_media.mp3?.length > 0 ||
      product.portal_media.mp4?.length > 0 ||
      product.portal_media.youtube?.length > 0 ||
      product.portal_media.cloudflare?.length > 0 ||
      product.portal_media.podbean?.length > 0 ||
      product.portal_media.vimeo?.length > 0
    );
    console.log(`[hasPortalMedia] ${product.slug}:`, result, product.portal_media);
    return result;
  };

  const hasAudioContent = (product: any) => {
    if (product.digital_content_url) return true;
    if (!product.portal_media) return false;

    // Handle list format - check if any item has audio_url
    if (Array.isArray(product.portal_media)) {
      return product.portal_media.some((item: any) => item.audio_url);
    }

    // Handle dict format
    return !!(
      product.portal_media.mp3?.length > 0 ||
      product.portal_media.podbean?.length > 0
    );
  };

  // Get badge labels based on product type (returns array for multiple badges)
  const getTypeBadges = (type: string): string[] => {
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
    return typeMap[type] || ['Digital'];
  };

  // Filter purchases based on selected category and search query
  const filteredPurchases = useMemo(() => {
    let filtered = [...purchases];

    // Filter by category
    if (selectedCategory !== 'All products') {
      if (selectedCategory === 'Past online retreats') {
        filtered = filtered.filter(p =>
          p.product.type === 'RETREAT_PORTAL_ACCESS' ||
          (p.product.categories && p.product.categories.some((cat: string) =>
            cat.toLowerCase().includes('online retreat') || cat.toLowerCase().includes('retreat')
          ))
        );
      } else if (selectedCategory === 'Ebooks') {
        filtered = filtered.filter(p => p.product.type === 'EBOOK');
      } else if (selectedCategory === 'Guided meditations') {
        filtered = filtered.filter(p =>
          p.product.type === 'GUIDED_MEDITATION' ||
          (p.product.categories && p.product.categories.some((cat: string) => cat.toLowerCase().includes('guided meditation')))
        );
      } else if (selectedCategory === 'Shunyamurti reads') {
        filtered = filtered.filter(p =>
          p.product.categories && p.product.categories.some((cat: string) => cat.toLowerCase().includes('shunyamurti read'))
        );
      } else if (selectedCategory === 'Book group') {
        filtered = filtered.filter(p =>
          p.product.categories && p.product.categories.some((cat: string) => cat.toLowerCase().includes('book group'))
        );
      } else if (selectedCategory === 'Courses') {
        filtered = filtered.filter(p =>
          p.product.categories && p.product.categories.some((cat: string) => cat.toLowerCase().includes('course'))
        );
      }
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((purchase) =>
        purchase.product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (purchase.product.description && purchase.product.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  }, [purchases, selectedCategory, searchQuery]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="min-h-screen lg:min-h-[125vh] bg-[#FAF8F1]">
      {/* Header Section */}
      <div className="flex flex-col px-8 pt-8 pb-8 border-b border-[#E5E7EB]">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-[#000000] mb-2" style={{ fontFamily: 'Optima, serif' }}>
              My Purchases
            </h1>
            <p className="text-[#717680]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              View and access your purchased products, including retreat portals and digital content.
            </p>
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#D5D7DA] rounded-lg shadow-sm w-[320px]">
            <Search className="w-5 h-5 text-[#717680]" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearch}
              className="flex-1 text-base text-[#717680] outline-none bg-transparent"
              style={{ fontFamily: "Avenir Next, sans-serif" }}
            />
            <div className="px-1 py-0.5 border border-[#E9EAEB] rounded text-xs text-[#717680] mix-blend-multiply">
              ⌘K
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 overflow-x-auto">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`pb-3 px-1 border-b-2 transition-colors text-sm font-medium whitespace-nowrap ${
                selectedCategory === category
                  ? 'border-[#7D1A13] text-[#7D1A13]'
                  : 'border-transparent text-[#717680] hover:text-[#000000]'
              }`}
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Processing Payment State */}
        {processingPayment && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <CheckCircle size={32} className="text-green-600 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-[#000000] mb-2" style={{ fontFamily: 'Optima, serif' }}>
              Processing Your Purchase
            </h2>
            <p className="text-[#717680] text-center max-w-md mb-8" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              Your payment was successful! We're setting up your access now...
            </p>
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-[#7D1A13] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-[#7D1A13] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-[#7D1A13] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}

        {/* Payment Error State */}
        {paymentError && !processingPayment && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Payment Issue</h3>
                <p>{paymentError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading/Content States (only show if not processing payment) */}
        {!processingPayment && loading ? (
          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 h-48 animate-pulse" />
            ))}
          </div>
        ) : !processingPayment && filteredPurchases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
              <ShoppingCart size={32} className="text-[#717680]" />
            </div>
            <h2 className="text-2xl font-bold text-[#000000] mb-2" style={{ fontFamily: 'Optima, serif' }}>
              {searchQuery ? 'No purchases found' : selectedCategory === 'All products' ? 'No purchases yet' : `No ${selectedCategory.toLowerCase()} purchases`}
            </h2>
            <p className="text-[#717680] text-center max-w-md mb-8" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              {searchQuery
                ? 'Try adjusting your search query'
                : selectedCategory === 'All products'
                ? 'Start exploring our dharma bandhara to find transformative content and retreat portals.'
                : `You haven't purchased any ${selectedCategory.toLowerCase()} yet.`}
            </p>
            {!searchQuery && selectedCategory === 'All products' && (
              <Link
                href="/dashboard/user/dharma-bandhara"
                className="px-6 py-3 bg-[#7D1A13] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
              >
                Browse Store
              </Link>
            )}
          </div>
        ) : !processingPayment ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-[#717680]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                {filteredPurchases.length} {filteredPurchases.length === 1 ? 'purchase' : 'purchases'}
              </p>
            </div>

            {/* Purchases Grid */}
            <div className="grid gap-6">
              {filteredPurchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row gap-6 p-6">
                    {/* Product Image */}
                    <div className="relative w-full md:w-64 aspect-square bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {(purchase.product.thumbnail_url || purchase.product.featured_image) ? (
                        <img
                          src={purchase.product.thumbnail_url || purchase.product.featured_image}
                          alt={purchase.product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ShoppingCart size={48} />
                        </div>
                      )}
                      {/* Product Type Badges */}
                      <div className="absolute bottom-3 left-3 flex gap-2">
                        {getTypeBadges(purchase.product.type).map((badge, index) => (
                          <span key={index} className="bg-[#525252]/60 backdrop-blur-sm text-white px-2 py-1 text-[10px] font-medium rounded">
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-[#000000] mb-3" style={{ fontFamily: 'Optima, serif' }}>
                          {purchase.product.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-[#717680]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>Purchased {new Date(purchase.granted_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}</span>
                          </div>
                          {purchase.amount_paid && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              <span>${purchase.amount_paid.toFixed(2)}</span>
                            </div>
                          )}
                          {purchase.order_number && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs">Order #{purchase.order_number}</span>
                            </div>
                          )}
                        </div>

                        {/* Expiration Warning */}
                        {purchase.expires_at && (
                          <div className={`flex items-start gap-2 mb-4 p-3 rounded-lg ${
                            purchase.is_expired ? 'bg-red-50' : 'bg-orange-50'
                          }`}>
                            <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                              purchase.is_expired ? 'text-red-600' : 'text-orange-600'
                            }`} />
                            <p className={`text-sm ${
                              purchase.is_expired ? 'text-red-700' : 'text-orange-700'
                            }`} style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                              {purchase.is_expired
                                ? `Access expired on ${new Date(purchase.expires_at).toLocaleDateString()}`
                                : `Access expires on ${new Date(purchase.expires_at).toLocaleDateString()}`
                              }
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        {purchase.is_expired ? (
                          <Button
                            disabled
                            variant="outline"
                            className="opacity-50 cursor-not-allowed"
                            style={{ fontFamily: 'Avenir Next, sans-serif' }}
                          >
                            Access Expired
                          </Button>
                        ) : purchase.product.type === 'EBOOK' && purchase.product.digital_content_url ? (
                          <Button
                            onClick={() => {
                              setSelectedProduct(purchase.product);
                              setEbookModalOpen(true);
                            }}
                            className="bg-[#7D1A13] hover:bg-[#7D1A13]/90 text-white"
                            style={{ fontFamily: 'Avenir Next, sans-serif' }}
                          >
                            <BookOpen className="w-4 h-4 mr-2" />
                            Read Ebook
                          </Button>
                        ) : (purchase.product.type === 'GUIDED_MEDITATION' || purchase.product.type === 'AUDIO') && hasAudioContent(purchase.product) ? (
                          <Button
                            onClick={() => {
                              setSelectedProduct(purchase.product);
                              setAudioModalOpen(true);
                            }}
                            className="bg-[#7D1A13] hover:bg-[#7D1A13]/90 text-white"
                            style={{ fontFamily: 'Avenir Next, sans-serif' }}
                          >
                            <Headphones className="w-4 h-4 mr-2" />
                            Listen
                          </Button>
                        ) : hasPortalMedia(purchase.product) && purchase.product.retreat_slug ? (
                          <Link href={`/dashboard/user/retreats/${purchase.product.retreat_slug}`}>
                            <Button
                              className="bg-[#7D1A13] hover:bg-[#7D1A13]/90 text-white"
                              style={{ fontFamily: 'Avenir Next, sans-serif' }}
                            >
                              Access Portal
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </Button>
                          </Link>
                        ) : hasPortalMedia(purchase.product) ? (
                          <Button
                            onClick={() => {
                              // If has video content, could open a video player modal
                              // For now, just show audio player if has audio
                              if (hasAudioContent(purchase.product)) {
                                setSelectedProduct(purchase.product);
                                setAudioModalOpen(true);
                              }
                            }}
                            className="bg-[#7D1A13] hover:bg-[#7D1A13]/90 text-white"
                            style={{ fontFamily: 'Avenir Next, sans-serif' }}
                          >
                            <PlayCircle className="w-4 h-4 mr-2" />
                            View Media
                          </Button>
                        ) : (
                          <Link href={`/store/${purchase.product.slug}`}>
                            <Button
                              variant="outline"
                              className="border-[#7D1A13] text-[#7D1A13] hover:bg-[#7D1A13]/5"
                              style={{ fontFamily: 'Avenir Next, sans-serif' }}
                            >
                              View Product Details
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}
      </div>

      {/* Modals */}
      {ebookModalOpen && selectedProduct && (
        <EnhancedEbookViewer
          product={selectedProduct}
          onClose={() => {
            setEbookModalOpen(false);
            setSelectedProduct(null);
          }}
        />
      )}

      {audioModalOpen && selectedProduct && (
        <AudioPlayerModal
          product={selectedProduct}
          onClose={() => {
            setAudioModalOpen(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}
