/**
 * Shared API utilities for consistent URL handling across all API clients
 */

/**
 * Ensures URL uses HTTPS in production and cleans whitespace/newlines
 * @param url - The API URL from environment variable
 * @returns Cleaned and secured URL
 */
export function ensureSecureApiUrl(url: string): string {
  // Clean whitespace and newlines
  const cleanUrl = url.trim().replace(/[\n\r]/g, '');

  // In production (browser with HTTPS), ensure HTTPS
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    if (cleanUrl.startsWith('http://') && !cleanUrl.includes('localhost')) {
      const secureUrl = cleanUrl.replace('http://', 'https://');
      console.log(`[API] Upgrading to HTTPS: ${cleanUrl} -> ${secureUrl}`);
      return secureUrl;
    }
  }

  return cleanUrl;
}

/**
 * Get the FastAPI base URL with automatic HTTPS upgrade in production
 */
export function getFastapiUrl(): string {
  const rawUrl = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';
  return ensureSecureApiUrl(rawUrl);
}
