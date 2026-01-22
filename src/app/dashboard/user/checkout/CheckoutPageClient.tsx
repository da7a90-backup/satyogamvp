'use client';

import { useEffect, useState, Suspense } from 'react';
import CheckoutClient from './CheckoutClient';
import { Loader2 } from 'lucide-react';

declare global {
  interface Window {
    Tilopay: any;
    jQuery: any;
    $: any;
  }
}

// Load script helper
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

// Wrapper to handle SDK loading
function CheckoutContentWrapper() {
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [jqueryLoaded, setJqueryLoaded] = useState(false);
  const [tilopayLoaded, setTilopayLoaded] = useState(false);

  // Check session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const sessionData = await response.json();

        if (!sessionData || !sessionData.user) {
          window.location.href = '/login?callbackUrl=/dashboard/user/checkout';
          return;
        }

        console.log('Session loaded:', sessionData.user.email);
        setSession(sessionData);
      } catch (error) {
        console.error('Session check failed:', error);
        window.location.href = '/login?callbackUrl=/dashboard/user/checkout';
      } finally {
        setSessionLoading(false);
      }
    };

    checkSession();
  }, []);

  // Load scripts
  useEffect(() => {
    const loadScripts = async () => {
      try {
        // Load jQuery first
        console.log('Loading jQuery...');
        await loadScript('https://code.jquery.com/jquery-3.6.0.min.js');
        console.log('✅ jQuery loaded:', typeof window.jQuery);
        setJqueryLoaded(true);

        // Wait a bit for jQuery to fully initialize
        await new Promise(resolve => setTimeout(resolve, 100));

        // Load Tilopay SDK
        console.log('Loading Tilopay SDK...');
        await loadScript('https://app.tilopay.com/sdk/v2/sdk_tpay.min.js');
        console.log('✅ Tilopay SDK loaded:', typeof window.Tilopay);
        setTilopayLoaded(true);
      } catch (error) {
        console.error('❌ Script loading error:', error);
      }
    };

    loadScripts();
  }, []);

  // Check if both SDKs are ready
  useEffect(() => {
    if (jqueryLoaded && tilopayLoaded) {
      console.log('✅ Both SDKs loaded successfully');
      setSdkLoaded(true);
    }
  }, [jqueryLoaded, tilopayLoaded]);

  // Show loading states
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
            jQuery: {jqueryLoaded ? '✓' : '✗'} | Tilopay: {tilopayLoaded ? '✓' : '✗'}
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <CheckoutClient session={session} />;
}

export default CheckoutContentWrapper;
