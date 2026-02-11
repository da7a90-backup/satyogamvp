/**
 * Shared API utilities for consistent URL handling across all API clients
 */

/**
 * Get the FastAPI base URL with automatic HTTPS upgrade in production
 * MUST be called at request time (not module load time) to ensure browser context
 */
export function getFastapiUrl(): string {
  let rawUrl = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

  // Clean whitespace and newlines
  rawUrl = rawUrl.trim().replace(/[\n\r]/g, '');

  // In browser context with HTTPS, force HTTPS for all non-localhost URLs
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    if (rawUrl.startsWith('http://') && !rawUrl.includes('localhost') && !rawUrl.includes('127.0.0.1')) {
      rawUrl = rawUrl.replace('http://', 'https://');
      console.log(`[API] Upgraded to HTTPS: ${rawUrl}`);
    }
  }

  return rawUrl;
}
