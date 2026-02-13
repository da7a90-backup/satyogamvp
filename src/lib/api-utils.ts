/**
 * Shared API utilities for consistent URL handling across all API clients
 */

/**
 * Get the FastAPI base URL with automatic HTTPS upgrade in production
 * MUST be called at request time (not module load time) to ensure browser context
 */
export function getFastapiUrl(): string {
  const rawEnvUrl = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

  // Clean whitespace and newlines
  let cleanUrl = rawEnvUrl.trim().replace(/[\n\r]/g, '');

  // ULTRA AGGRESSIVE: Force HTTPS for any cloudflare tunnel URL
  if (cleanUrl.includes('trycloudflare.com') && cleanUrl.startsWith('http://')) {
    cleanUrl = cleanUrl.replace('http://', 'https://');
    console.warn('[API-UTILS] 🔒 CLOUDFLARE TUNNEL HTTPS UPGRADE:', cleanUrl);
  }

  // AGGRESSIVE: Force HTTPS in browser on HTTPS pages
  if (typeof window !== 'undefined') {
    const isHttpsPage = window.location.protocol === 'https:';
    const isHttpUrl = cleanUrl.startsWith('http://');
    const isNotLocalhost = !cleanUrl.includes('localhost') && !cleanUrl.includes('127.0.0.1');

    console.log('[API-UTILS] Raw env:', rawEnvUrl);
    console.log('[API-UTILS] Clean URL:', cleanUrl);
    console.log('[API-UTILS] Page protocol:', window.location.protocol);
    console.log('[API-UTILS] Is HTTP URL:', isHttpUrl);
    console.log('[API-UTILS] Is not localhost:', isNotLocalhost);

    if (isHttpsPage && isHttpUrl && isNotLocalhost) {
      cleanUrl = cleanUrl.replace('http://', 'https://');
      console.warn('[API-UTILS] ⚠️  FORCED HTTPS UPGRADE:', cleanUrl);
    }
  }

  console.log('[API-UTILS] Final URL:', cleanUrl);
  return cleanUrl;
}
