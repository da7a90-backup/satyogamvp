'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortalViewer } from '@/components/store/PortalViewer';
import { productsApi } from '@/lib/store-api';

export default function PortalAccessPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (session) checkAccessAndLoad();
  }, [session, params.slug]);

  const checkAccessAndLoad = async () => {
    try {
      setLoading(true);
      const productData = await productsApi.getProduct(params.slug as string);
      setProduct(productData);

      const token = localStorage.getItem('authToken');
      const accessResponse = await fetch(
        `${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/users/me/purchases/${productData.id}/check`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (accessResponse.ok) {
        const { has_access } = await accessResponse.json();
        setHasAccess(has_access);
        if (!has_access) router.push('/dashboard/user/purchases');
      }
    } catch (error) {
      console.error('Failed to load product:', error);
      router.push('/dashboard/user/purchases');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B7355]"></div>
      </div>
    );
  }

  if (!hasAccess || !product) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/dashboard/user/purchases')}>
          <ArrowLeft className="w-4 h-4 mr-2" />Back to Purchases
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
        <p className="text-gray-600">Access your retreat content below</p>
      </div>

      {product.portal_media && (
        <PortalViewer portalMedia={product.portal_media} productTitle={product.title} />
      )}
    </div>
  );
}
