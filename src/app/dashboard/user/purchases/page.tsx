'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Calendar, DollarSign, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Purchase {
  id: string;
  product: {
    id: string;
    slug: string;
    title: string;
    featured_image: string;
    type: string;
    portal_media: any;
  };
  order_id: string;
  purchased_at: string;
  amount: number;
  access_expires_at: string | null;
}

export default function PurchasesPage() {
  const { data: session } = useSession();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) loadPurchases();
  }, [session]);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/users/me/purchases`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPurchases(data);
      }
    } catch (error) {
      console.error('Failed to load purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasPortalMedia = (product: any) => {
    return product.portal_media && (
      product.portal_media.mp3?.length > 0 ||
      product.portal_media.mp4?.length > 0 ||
      product.portal_media.youtube?.length > 0
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Purchases</h1>
        <p className="text-gray-600">View and access your purchased products</p>
      </div>

      {loading ? (
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 border h-32 animate-pulse" />
          ))}
        </div>
      ) : purchases.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center border">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">No purchases yet</h2>
          <p className="text-gray-600 mb-6">Start exploring our store to find amazing content</p>
          <Link href="/store">
            <Button className="bg-[#8B7355] hover:bg-[#8B7355]/90">Browse Store</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {purchases.map((purchase) => (
            <div key={purchase.id} className="bg-white rounded-lg overflow-hidden border hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row gap-6 p-6">
                <div className="relative w-full md:w-48 aspect-square bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {purchase.product.featured_image && (
                    <Image src={purchase.product.featured_image} alt={purchase.product.title} fill className="object-cover" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs text-[#8B7355] mb-1">{purchase.product.type.replace(/_/g, ' ')}</p>
                      <h3 className="text-xl font-semibold mb-2">{purchase.product.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Purchased {new Date(purchase.purchased_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>${purchase.amount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {hasPortalMedia(purchase.product) ? (
                    <Link href={`/dashboard/user/purchases/${purchase.product.slug}`}>
                      <Button className="bg-[#8B7355] hover:bg-[#8B7355]/90">
                        Access Retreat Portal<ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/store/${purchase.product.slug}`}>
                      <Button variant="outline">View Product Details</Button>
                    </Link>
                  )}

                  {purchase.access_expires_at && (
                    <p className="text-xs text-orange-600 mt-2">
                      Access expires: {new Date(purchase.access_expires_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
