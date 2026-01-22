'use client';

import { useState, useRef, useEffect, memo } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Maximize2, Minimize2, Monitor, Tablet, Smartphone, AlertCircle } from 'lucide-react';

interface LivePreviewPanelProps {
  pageSlug: string;
  onClose?: () => void;
}

type ViewportMode = 'desktop' | 'tablet' | 'mobile';

const VIEWPORT_SIZES = {
  desktop: { width: '100%', label: 'Desktop' },
  tablet: { width: '768px', label: 'Tablet' },
  mobile: { width: '375px', label: 'Mobile' }
};

const LOAD_TIMEOUT = 30000; // 30 seconds

function LivePreviewPanel({ pageSlug, onClose }: LivePreviewPanelProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');
  const [refreshKey, setRefreshKey] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track component lifecycle
  useEffect(() => {
    console.log('[LivePreviewPanel] Component mounted for page:', pageSlug);
    return () => {
      console.log('[LivePreviewPanel] Component unmounting');
    };
  }, []);

  // Track refresh key changes
  useEffect(() => {
    console.log('[LivePreviewPanel] refreshKey changed to:', refreshKey);
  }, [refreshKey]);

  // Determine the preview URL based on page slug
  const getPreviewUrl = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

    // Map page slugs to actual routes
    const routeMap: Record<string, string> = {
      'homepage': '/',
      'about-satyoga': '/about/satyoga',
      'about-shunyamurti': '/about/shunyamurti',
      'about-ashram': '/about/ashram',
      'teachings': '/teachings',
      'courses': '/courses',
      'donate': '/donate',
      'contact': '/contact',
      'membership': '/membership',
      'faqs': '/faqs'
    };

    const route = routeMap[pageSlug] || `/${pageSlug}`;
    // Use stable preview param without timestamp to avoid refresh loops
    return `${baseUrl}${route}?preview=true`;
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, []);

  // Set timeout whenever loading starts
  useEffect(() => {
    if (isLoading) {
      // Clear any existing timeout
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }

      // Set new timeout
      loadTimeoutRef.current = setTimeout(() => {
        if (isLoading) {
          setIsLoading(false);
          setLoadError('Preview timed out. The page is taking too long to load. Please try refreshing.');
        }
      }, LOAD_TIMEOUT);
    } else {
      // Clear timeout when loading completes
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }
    }
  }, [isLoading, refreshKey]);

  const handleRefresh = () => {
    console.log('[LivePreviewPanel] Manual refresh triggered');
    setIsLoading(true);
    setLoadError(null);
    // Increment key to force iframe remount
    setRefreshKey(prev => prev + 1);
  };

  const handleIframeLoad = () => {
    console.log('[LivePreviewPanel] ✅ Iframe loaded successfully');
    setIsLoading(false);
    setLoadError(null);
  };

  const handleIframeError = () => {
    console.error('[LivePreviewPanel] ❌ Iframe failed to load');
    setIsLoading(false);
    setLoadError('Failed to load preview. Please check if the page exists and try again.');
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      className={`
        flex flex-col bg-white border-l border-gray-200
        ${isFullscreen ? 'fixed inset-0 z-50' : 'h-full'}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-700">Live Preview</h3>
          {isLoading && (
            <RefreshCw className="h-3 w-3 animate-spin text-gray-400" />
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Viewport Mode Selector */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-md p-1">
            <Button
              type="button"
              variant={viewportMode === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewportMode('desktop')}
              className="h-7 px-2"
              title="Desktop view"
            >
              <Monitor className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant={viewportMode === 'tablet' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewportMode('tablet')}
              className="h-7 px-2"
              title="Tablet view"
            >
              <Tablet className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant={viewportMode === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewportMode('mobile')}
              className="h-7 px-2"
              title="Mobile view"
            >
              <Smartphone className="h-3 w-3" />
            </Button>
          </div>

          {/* Refresh Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-7 px-2"
            title="Refresh preview"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>

          {/* Fullscreen Toggle */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="h-7 px-2"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="h-3 w-3" />
            ) : (
              <Maximize2 className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex-1 overflow-hidden bg-gray-100 p-4">
        <div
          className="h-full mx-auto transition-all duration-300 bg-white shadow-lg"
          style={{
            width: VIEWPORT_SIZES[viewportMode].width,
            maxWidth: '100%'
          }}
        >
          {/* Loading Overlay */}
          {isLoading && !loadError && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Loading preview...</p>
              </div>
            </div>
          )}

          {/* Error Display */}
          {loadError && (
            <div className="flex items-center justify-center h-full p-8">
              <div className="text-center max-w-md">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Preview Error</h3>
                <p className="text-sm text-gray-600 mb-4">{loadError}</p>
                <Button onClick={handleRefresh} variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Iframe */}
          {!loadError && (
            <iframe
              ref={iframeRef}
              key={`preview-${pageSlug}-${refreshKey}`}
              src={getPreviewUrl()}
              className={`w-full h-full border-0 ${isLoading ? 'hidden' : 'block'}`}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title="Page Preview"
            />
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-3 py-2 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          {VIEWPORT_SIZES[viewportMode].label} • {pageSlug}
        </p>
      </div>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders when parent component updates
export default memo(LivePreviewPanel);
