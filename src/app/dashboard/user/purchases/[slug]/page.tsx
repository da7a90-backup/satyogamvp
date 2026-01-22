'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortalViewer } from '@/components/store/PortalViewer';
import { EnhancedPortalViewer } from '@/components/retreat/EnhancedPortalViewer';

export const dynamic = 'force-dynamic';

export default function PortalAccessPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.accessToken) {
      loadPortalAccess();
    }
  }, [session, params.slug]);

  const loadPortalAccess = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = session?.user?.accessToken || localStorage.getItem('authToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/products/${params.slug}/portal-access`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 403) {
        const errorData = await response.json();
        setError(errorData.detail || 'Access denied');
        setTimeout(() => router.push('/dashboard/user/purchases'), 2000);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to load portal access');
      }

      const data = await response.json();
      console.log('[PORTAL ACCESS] ===== FULL API RESPONSE =====');
      console.log('[PORTAL ACCESS] Product title:', data.title);
      console.log('[PORTAL ACCESS] Product type:', data.type);
      console.log('[PORTAL ACCESS] digital_content_url:', data.digital_content_url);
      console.log('[PORTAL ACCESS] has_retreat_portal:', data.has_retreat_portal);
      console.log('[PORTAL ACCESS] portal_media type:', typeof data.portal_media);
      console.log('[PORTAL ACCESS] portal_media is array?', Array.isArray(data.portal_media));

      if (data.portal_media) {
        console.log('[PORTAL ACCESS] portal_media keys:', Object.keys(data.portal_media));
        console.log('[PORTAL ACCESS] portal_media.youtube:', data.portal_media.youtube?.length || 0, 'items');
        console.log('[PORTAL ACCESS] portal_media.mp3:', data.portal_media.mp3?.length || 0, 'items');
        console.log('[PORTAL ACCESS] portal_media.vimeo:', data.portal_media.vimeo?.length || 0, 'items');
        console.log('[PORTAL ACCESS] portal_media.cloudflare:', data.portal_media.cloudflare?.length || 0, 'items');
        console.log('[PORTAL ACCESS] portal_media.mp4:', data.portal_media.mp4?.length || 0, 'items');

        if (data.portal_media.youtube?.length > 0) {
          console.log('[PORTAL ACCESS] First YouTube URL:', data.portal_media.youtube[0]);
        }
      } else {
        console.log('[PORTAL ACCESS] ❌ portal_media is NULL or undefined!');
      }

      console.log('[PORTAL ACCESS] ===========================');
      setProduct(data);
    } catch (error: any) {
      console.error('Failed to load portal access:', error);
      setError(error.message || 'Failed to load portal');
      setTimeout(() => router.push('/dashboard/user/purchases'), 2000);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAF8F1]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D1A13] mx-auto mb-4"></div>
          <p className="text-[#717680]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            Loading your portal...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAF8F1]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-red-600 text-3xl">⚠</span>
          </div>
          <h2 className="text-2xl font-bold text-[#000000] mb-2" style={{ fontFamily: 'Optima, serif' }}>
            Access Error
          </h2>
          <p className="text-[#717680] mb-4" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
            {error}
          </p>
          <Button
            onClick={() => router.push('/dashboard/user/purchases')}
            className="bg-[#7D1A13] hover:bg-[#7D1A13]/90 text-white"
            style={{ fontFamily: 'Avenir Next, sans-serif' }}
          >
            Return to Purchases
          </Button>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-[#FAF8F1]">
      {/* Header */}
      <div className="flex flex-col px-8 pt-8 pb-6 border-b border-[#E5E7EB] bg-white">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/user/purchases')}
            className="text-[#7D1A13] hover:text-[#7D1A13]/80"
            style={{ fontFamily: 'Avenir Next, sans-serif' }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Purchases
          </Button>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-[#000000] mb-2" style={{ fontFamily: 'Optima, serif' }}>
            {product.title}
          </h1>
          {product.has_retreat_portal && product.retreat_data ? (
            <p className="text-[#717680]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              {product.retreat_data.description || 'Access your retreat content organized by day'}
            </p>
          ) : (
            <p className="text-[#717680]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              Access your purchased content below
            </p>
          )}
        </div>
      </div>

      {/* Portal Content */}
      <div className="p-8">
        {product.has_retreat_portal && product.retreat_data ? (
          // Enhanced portal with day-by-day structure
          <EnhancedPortalViewer
            productTitle={product.title}
            portalMedia={product.portal_media}
            retreatData={product.retreat_data}
          />
        ) : product.portal_media || product.digital_content_url ? (
          // Simple carousel for products without retreat structure
          <PortalViewer
            portalMedia={product.portal_media}
            productTitle={product.title}
            digitalContentUrl={product.digital_content_url}
          />
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-[#717680]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
              No media content available for this product
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
