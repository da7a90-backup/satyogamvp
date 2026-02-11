// app/layout.tsx

import './globals.css';
import '@/lib/fetch-interceptor'; // Install fetch interceptor to catch HTTP requests
import { Metadata } from 'next';
import Script from 'next/script';
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import AuthProvider from '@/components/auth/AuthProvider';
import { AnalyticsProvider } from '@/contexts/AnalyticsContext';
import GA4Provider from '@/components/analytics/GA4Provider';

// Metadata for all pages (SEO)
export const metadata: Metadata = {
  title: {
    default: 'Sat Yoga - Spiritual Growth and Self-Discovery',
    template: '%s | Sat Yoga'
  },
  description: 'Explore transformative teachings, retreats, and courses at Sat Yoga. Join our community dedicated to spiritual awakening and self-discovery.',
  keywords: ['meditation', 'yoga', 'spiritual growth', 'retreats', 'mindfulness'],
  openGraph: {
    title: 'Sat Yoga - Spiritual Growth and Self-Discovery',
    description: 'Explore transformative teachings, retreats, and courses at Sat Yoga. Join our community dedicated to spiritual awakening and self-discovery.',
    url: 'https://satyoga.com',
    siteName: 'Sat Yoga',
    locale: 'en_US',
    type: 'website',
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        {/* Disable Fast Refresh and auto-reload when in preview mode */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === 'undefined' || !window.location.search.includes('preview=true')) {
                  return;
                }

                console.log('[Preview Mode] Disabling all auto-refresh mechanisms');

                // Track page loads to detect refresh loops
                let loadCount = parseInt(sessionStorage.getItem('previewLoadCount') || '0');
                loadCount++;
                sessionStorage.setItem('previewLoadCount', loadCount.toString());
                console.log('[Preview Mode] Page load count:', loadCount);

                // Monitor all navigation events
                window.addEventListener('beforeunload', function(e) {
                  console.error('[Preview Mode] ⚠️  BEFOREUNLOAD triggered!');
                  console.trace('[Preview Mode] Stack trace:');
                });

                // Track what's causing reloads
                const originalFetch = window.fetch;
                window.fetch = function(...args) {
                  const url = args[0];
                  if (typeof url === 'string' && url.includes('_next')) {
                    console.log('[Preview Mode] Fetch to Next.js:', url);
                  }
                  return originalFetch.apply(this, args);
                };

                // Prevent page reloads
                window.__NEXT_PREVENT_REFRESH = true;

                // Block WebSocket connections (HMR)
                const originalWebSocket = window.WebSocket;
                window.WebSocket = function(url, protocols) {
                  if (url && (url.includes('/_next/webpack-hmr') || url.includes('hot-update'))) {
                    console.log('[Preview Mode] ✋ Blocked HMR websocket:', url);
                    return {
                      close: function() {},
                      send: function() {},
                      addEventListener: function() {},
                      removeEventListener: function() {},
                      readyState: 1,
                      CONNECTING: 0,
                      OPEN: 1,
                      CLOSING: 2,
                      CLOSED: 3
                    };
                  }
                  console.log('[Preview Mode] ⚠️  Allowing non-HMR websocket:', url);
                  return new originalWebSocket(url, protocols);
                };

                // Block EventSource (SSE)
                if (window.EventSource) {
                  const originalEventSource = window.EventSource;
                  window.EventSource = function(url) {
                    if (url && url.includes('/_next/')) {
                      console.log('[Preview Mode] ✋ Blocked EventSource:', url);
                      return {
                        close: function() {},
                        addEventListener: function() {},
                        removeEventListener: function() {},
                        readyState: 2,
                        CONNECTING: 0,
                        OPEN: 1,
                        CLOSED: 2
                      };
                    }
                    console.log('[Preview Mode] ⚠️  Allowing non-Next EventSource:', url);
                    return new originalEventSource(url);
                  };
                }

                // Prevent location reload
                const originalReload = window.location.reload.bind(window.location);
                window.location.reload = function() {
                  console.error('[Preview Mode] ⚠️  BLOCKED window.location.reload()');
                  console.trace('[Preview Mode] Reload called from:');
                  return;
                };

                // Intercept location changes
                const originalPushState = history.pushState;
                const originalReplaceState = history.replaceState;

                history.pushState = function(...args) {
                  console.log('[Preview Mode] history.pushState:', args[2]);
                  return originalPushState.apply(this, args);
                };

                history.replaceState = function(...args) {
                  console.log('[Preview Mode] history.replaceState:', args[2]);
                  return originalReplaceState.apply(this, args);
                };

                // Disable Next.js router refresh
                let routerRefreshAttempts = 0;
                Object.defineProperty(window, '__NEXT_DATA__', {
                  get: function() {
                    return this._nextData || {};
                  },
                  set: function(val) {
                    console.log('[Preview Mode] __NEXT_DATA__ set');
                    this._nextData = val;
                  }
                });

                // Prevent React error overlay from triggering reloads
                window.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__ = {
                  isStopped: true
                };

                // Monitor if iframe gets reloaded by parent
                console.log('[Preview Mode] 🔍 Initialization complete. Monitoring for refresh triggers...');
              })();
            `,
          }}
        />
        {/* Google Analytics 4 */}
        {process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                  send_page_view: false
                });
              `}
            </Script>
          </>
        )}
      </head>
      <body className="flex flex-col min-h-screen">
        <AuthProvider>
          <AnalyticsProvider>
            <GA4Provider>
              <LayoutWrapper>{children}</LayoutWrapper>
            </GA4Provider>
          </AnalyticsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}