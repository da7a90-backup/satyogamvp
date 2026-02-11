/**
 * Fetch interceptor to catch and upgrade HTTP to HTTPS requests
 * This is a safety net to prevent mixed content errors
 */

if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;

  window.fetch = function (...args: any[]) {
    let url = args[0];

    // If it's a string URL, check and upgrade
    if (typeof url === 'string') {
      const originalUrl = url;

      // Force upgrade HTTP to HTTPS for cloudflare URLs
      if (url.startsWith('http://') && url.includes('trycloudflare.com')) {
        url = url.replace('http://', 'https://');
        args[0] = url;
        console.error(`🚨 INTERCEPTED HTTP REQUEST - UPGRADED TO HTTPS:`);
        console.error(`   From: ${originalUrl}`);
        console.error(`   To:   ${url}`);
        console.trace('Stack trace:');
      }
    }

    // @ts-ignore
    return originalFetch.apply(this, args);
  };

  console.log('✅ Fetch interceptor installed - will catch and upgrade HTTP requests');
}

export {};
