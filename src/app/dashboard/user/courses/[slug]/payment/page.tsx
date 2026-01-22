'use client';

import { useEffect, useState, Suspense } from 'react';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect, useParams } from "next/navigation";
import CoursePaymentClient from "@/components/courses/CoursePaymentClient";
import Script from "next/script";
import { Loader2 } from 'lucide-react';

declare global {
  interface Window {
    Tilopay: any;
    jQuery: any;
    $: any;
  }
}

// Wrapper to handle SDK loading
function PaymentContentWrapper() {
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const params = useParams();
  const slug = params?.slug as string;

  // Check session independently
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

  // Check SDK independently
  useEffect(() => {
    let mounted = true;

    const checkSDK = () => {
      if (!mounted) return false;

      const tilopayReady = typeof window !== 'undefined' && typeof window.Tilopay !== 'undefined';
      const jqueryReady = typeof window !== 'undefined' && typeof window.jQuery !== 'undefined';

      console.log('SDK Check:', { tilopayReady, jqueryReady, mounted });

      if (tilopayReady && jqueryReady) {
        console.log('✅ Both SDKs ready, updating state');
        if (mounted) {
          setSdkLoaded(true);
        }
        return true;
      }
      return false;
    };

    // Initial check
    if (checkSDK()) {
      console.log('SDK already loaded on mount');
      return;
    }

    // Listen for SDK load event
    const handleLoad = () => {
      console.log('📡 tilopay-loaded event received');
      checkSDK();
    };

    window.addEventListener('tilopay-loaded', handleLoad);

    // Aggressive polling for SDK loading
    let attempts = 0;
    const maxAttempts = 200; // 10 seconds
    const interval = setInterval(() => {
      attempts++;
      const ready = checkSDK();
      if (ready) {
        console.log(`✅ SDK ready after ${attempts} attempts (${attempts * 50}ms)`);
        clearInterval(interval);
      } else if (attempts >= maxAttempts) {
        console.error('❌ SDK loading timeout after 10 seconds');
        clearInterval(interval);
      }
    }, 50);

    return () => {
      console.log('🧹 Cleaning up SDK check');
      mounted = false;
      window.removeEventListener('tilopay-loaded', handleLoad);
      clearInterval(interval);
    };
  }, []);

  // Show different loading states
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

  if (!sdkLoaded) {
    return (
      <div className="min-h-screen bg-[#FAF8F1] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7D1A13] mx-auto mb-4"></div>
          <p>Loading payment system...</p>
          <p className="text-sm text-gray-500 mt-2">
            jQuery: {typeof window !== 'undefined' && window.jQuery ? '✓' : '✗'} |
            Tilopay: {typeof window !== 'undefined' && window.Tilopay ? '✓' : '✗'}
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <CoursePaymentClient slug={slug} session={session} />;
}

export default function CoursePaymentPage() {
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  useEffect(() => {
    // Load jQuery first, then Tilopay
    const loadScripts = async () => {
      // Load jQuery
      const jqueryScript = document.createElement('script');
      jqueryScript.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
      jqueryScript.async = false; // Load synchronously

      await new Promise((resolve, reject) => {
        jqueryScript.onload = () => {
          console.log('✅ jQuery loaded:', typeof window.jQuery);
          resolve(true);
        };
        jqueryScript.onerror = () => {
          console.error('❌ Failed to load jQuery');
          reject();
        };
        document.head.appendChild(jqueryScript);
      });

      // Load Tilopay SDK after jQuery
      const tilopayScript = document.createElement('script');
      tilopayScript.src = 'https://app.tilopay.com/sdk/v2/sdk_tpay.min.js';
      tilopayScript.async = true;

      await new Promise((resolve, reject) => {
        tilopayScript.onload = () => {
          console.log('✅ Tilopay SDK loaded:', typeof window.Tilopay);
          console.log('jQuery still available:', typeof window.jQuery);
          window.dispatchEvent(new Event('tilopay-loaded'));
          resolve(true);
        };
        tilopayScript.onerror = () => {
          console.error('❌ Failed to load Tilopay SDK');
          reject();
        };
        document.head.appendChild(tilopayScript);
      });

      setScriptsLoaded(true);
    };

    loadScripts().catch(console.error);
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
