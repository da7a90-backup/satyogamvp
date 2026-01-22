'use client';

import { useEffect, useState, Suspense } from 'react';
import { redirect, useParams } from "next/navigation";
import { Loader2 } from 'lucide-react';

declare global {
  interface Window {
    Tilopay: any;
    jQuery: any;
    $: any;
  }
}

// Import the payment client component (we'll create this next)
import ProductPaymentClient from '@/components/store/ProductPaymentClient';

// Wrapper to handle SDK loading
function PaymentContentWrapper() {
  const [session, setSession] = useState<any>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const params = useParams();
  const slug = params?.slug as string;

  // Check session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const sessionData = await response.json();

        if (!sessionData || !sessionData.user) {
          window.location.href = '/login';
          return;
        }

        console.log('Session loaded:', sessionData.user.email);
        setSession(sessionData);
      } catch (error) {
        console.error('Session check failed:', error);
        window.location.href = '/login';
      } finally {
        setSessionLoading(false);
      }
    };

    checkSession();
  }, []);

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F1] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-[#7D1A13] mx-auto mb-4 animate-spin" />
          <p>Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <ProductPaymentClient slug={slug} session={session} />;
}

export default function ProductPaymentPage() {
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  useEffect(() => {
    // Check if scripts are already loaded
    if (typeof window !== 'undefined' && window.jQuery && window.Tilopay) {
      console.log('✅ Scripts already loaded');
      setScriptsLoaded(true);
      return;
    }

    // Load jQuery first, then Tilopay
    const loadScripts = async () => {
      try {
        // Load jQuery if not already loaded
        if (!window.jQuery) {
          const jqueryScript = document.createElement('script');
          jqueryScript.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
          jqueryScript.async = false;

          await new Promise((resolve, reject) => {
            jqueryScript.onload = () => {
              console.log('✅ jQuery loaded');
              resolve(true);
            };
            jqueryScript.onerror = reject;
            document.head.appendChild(jqueryScript);
          });
        }

        // Load Tilopay SDK if not already loaded
        if (!window.Tilopay) {
          const tilopayScript = document.createElement('script');
          tilopayScript.src = 'https://app.tilopay.com/sdk/v2/sdk_tpay.min.js';
          tilopayScript.async = false;

          await new Promise((resolve, reject) => {
            tilopayScript.onload = () => {
              console.log('✅ Tilopay SDK loaded');
              resolve(true);
            };
            tilopayScript.onerror = reject;
            document.head.appendChild(tilopayScript);
          });
        }

        setScriptsLoaded(true);
      } catch (error) {
        console.error('❌ Failed to load payment scripts:', error);
      }
    };

    loadScripts();
  }, []);

  return (
    <>
      <Suspense fallback={
        <div className="min-h-screen bg-[#FAF8F1] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D1A13] mx-auto mb-4"></div>
            <p>Loading checkout...</p>
          </div>
        </div>
      }>
        <PaymentContentWrapper />
      </Suspense>
    </>
  );
}
