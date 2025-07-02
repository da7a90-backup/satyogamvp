// Video Preview Control Utilities
// Additional utilities for comprehensive video iframe control

// Universal video stop function for any iframe
export const stopAllVideos = () => {
    console.log('[VideoUtils] Stopping all videos on page');
    
    // Get all iframes on the page
    const iframes = document.querySelectorAll('iframe');
    const videos = document.querySelectorAll('video');
    
    let stoppedCount = 0;
    
    // Stop HTML5 video elements
    videos.forEach((video, index) => {
      try {
        video.pause();
        video.currentTime = 0;
        console.log(`[VideoUtils] Stopped HTML5 video ${index + 1}`);
        stoppedCount++;
      } catch (error) {
        console.error(`[VideoUtils] Failed to stop HTML5 video ${index + 1}:`, error);
      }
    });
    
    // Stop iframe videos
    iframes.forEach((iframe, index) => {
      try {
        const src = iframe.src;
        
        // YouTube iframe control
        if (src.includes('youtube.com') || src.includes('youtu.be')) {
          iframe.contentWindow?.postMessage(
            JSON.stringify({
              event: 'command',
              func: 'pauseVideo',
              args: []
            }),
            '*'
          );
          console.log(`[VideoUtils] Sent pause command to YouTube iframe ${index + 1}`);
        }
        
        // Cloudflare Stream iframe control
        else if (src.includes('videodelivery.net') || src.includes('cloudflarestream.com')) {
          iframe.contentWindow?.postMessage(
            JSON.stringify({ type: 'pause' }),
            'https://iframe.videodelivery.net'
          );
          console.log(`[VideoUtils] Sent pause command to Cloudflare iframe ${index + 1}`);
        }
        
        // Universal fallback - reset src
        else {
          const originalSrc = iframe.src;
          iframe.src = 'about:blank';
          
          // Restore src after brief pause to stop playback
          setTimeout(() => {
            iframe.src = originalSrc;
          }, 100);
          console.log(`[VideoUtils] Reset src for iframe ${index + 1}`);
        }
        
        stoppedCount++;
      } catch (error) {
        console.error(`[VideoUtils] Failed to stop iframe ${index + 1}:`, error);
      }
    });
    
    console.log(`[VideoUtils] Attempted to stop ${stoppedCount} video elements`);
    return stoppedCount;
  };
  
  // Enhanced YouTube iframe control
  export const controlYouTubeIframe = (
    iframe: HTMLIFrameElement,
    command: 'playVideo' | 'pauseVideo' | 'stopVideo' | 'seekTo',
    args: any[] = []
  ) => {
    try {
      const message = JSON.stringify({
        event: 'command',
        func: command,
        args: args
      });
      
      iframe.contentWindow?.postMessage(message, '*');
      console.log(`[VideoUtils] YouTube command sent: ${command}`, args);
      return true;
    } catch (error) {
      console.error(`[VideoUtils] YouTube command failed: ${command}`, error);
      return false;
    }
  };
  
  // Enhanced Cloudflare Stream iframe control
  export const controlCloudflareIframe = (
    iframe: HTMLIFrameElement,
    command: 'play' | 'pause' | 'seek',
    data?: any
  ) => {
    try {
      const message = JSON.stringify({
        type: command,
        ...data
      });
      
      iframe.contentWindow?.postMessage(message, 'https://iframe.videodelivery.net');
      console.log(`[VideoUtils] Cloudflare command sent: ${command}`, data);
      return true;
    } catch (error) {
      console.error(`[VideoUtils] Cloudflare command failed: ${command}`, error);
      return false;
    }
  };
  
  // Video platform detection
  export const detectVideoPlatform = (src: string): string => {
    if (src.includes('youtube.com') || src.includes('youtu.be')) {
      return 'youtube';
    }
    if (src.includes('videodelivery.net') || src.includes('cloudflarestream.com')) {
      return 'cloudflare';
    }
    if (src.includes('rumble.com')) {
      return 'rumble';
    }
    if (src.includes('vimeo.com')) {
      return 'vimeo';
    }
    return 'unknown';
  };
  
  // Enhanced video ID extraction
  export const extractVideoId = (url: string, platform: string): string | null => {
    try {
      switch (platform) {
        case 'youtube':
          // Handle various YouTube URL formats
          const youtubePatterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
            /youtube\.com\/watch\?.*v=([^&\n?#]+)/
          ];
          
          for (const pattern of youtubePatterns) {
            const match = url.match(pattern);
            if (match) return match[1];
          }
          break;
          
        case 'cloudflare':
          // Extract Cloudflare Stream video ID
          const cloudflareMatch = url.match(/\/([a-f0-9]{32})\/?$/);
          if (cloudflareMatch) return cloudflareMatch[1];
          break;
          
        case 'rumble':
          // Extract Rumble video ID
          const rumbleMatch = url.match(/rumble\.com\/embed\/([^\/]+)/);
          if (rumbleMatch) return rumbleMatch[1];
          break;
      }
      
      return null;
    } catch (error) {
      console.error(`[VideoUtils] Failed to extract video ID from ${url}:`, error);
      return null;
    }
  };
  
  // Video preview time formatter
  export const formatPreviewTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Preview progress calculator
  export const calculatePreviewProgress = (currentTime: number, previewDuration: number): number => {
    return Math.min((currentTime / previewDuration) * 100, 100);
  };
  
  // Check if video should be blocked for preview
  export const shouldBlockVideo = (
    isLoggedIn: boolean,
    teachingType: 'free' | 'membership',
    currentTime: number,
    previewDuration: number
  ): boolean => {
    if (isLoggedIn) return false;
    if (teachingType === 'membership') return true;
    return currentTime >= previewDuration;
  };
  
  // Enhanced postMessage listener for video events
  export const createVideoMessageListener = (
    onTimeUpdate?: (time: number) => void,
    onStateChange?: (state: string) => void,
    onError?: (error: any) => void
  ) => {
    return (event: MessageEvent) => {
      try {
        let data = event.data;
        
        // Handle string data
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch {
            return; // Invalid JSON, ignore
          }
        }
        
        console.log('[VideoUtils] Received postMessage:', data, 'from:', event.origin);
        
        // YouTube events
        if (data.event === 'video-progress' && data.info) {
          onTimeUpdate?.(data.info.currentTime);
        }
        
        // Cloudflare Stream events
        if (data.type === 'timeupdate' && data.currentTime !== undefined) {
          onTimeUpdate?.(data.currentTime);
        }
        
        // State changes
        if (data.event === 'onStateChange') {
          onStateChange?.(data.info);
        }
        
        // Errors
        if (data.event === 'onError' || data.type === 'error') {
          onError?.(data.info || data.error);
        }
        
      } catch (error) {
        console.error('[VideoUtils] Error processing video message:', error);
      }
    };
  };
  
  // Create preview blocker overlay
  export const createPreviewBlockerOverlay = (
    container: HTMLElement,
    imageUrl: string,
    title: string,
    onSignUp: () => void
  ): HTMLElement => {
    const overlay = document.createElement('div');
    overlay.className = 'video-preview-blocker';
    overlay.innerHTML = `
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      ">
        <div style="
          background: white;
          padding: 2rem;
          border-radius: 8px;
          text-align: center;
          max-width: 400px;
        ">
          <h3 style="margin: 0 0 1rem 0; font-size: 1.5rem;">Preview Ended</h3>
          <p style="margin: 0 0 1.5rem 0; color: #666;">
            Sign up to continue watching "${title}" and access our complete library.
          </p>
          <button 
            onclick="this.parentElement.parentElement.parentElement.dispatchEvent(new CustomEvent('signUp'))"
            style="
              background: #300001;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 4px;
              cursor: pointer;
              font-size: 1rem;
            "
          >
            Sign Up to Continue
          </button>
        </div>
      </div>
    `;
    
    overlay.addEventListener('signUp', onSignUp);
    container.appendChild(overlay);
    
    return overlay;
  };
  
  // Cleanup function for video resources
  export const cleanupVideoResources = (
    iframe: HTMLIFrameElement | null,
    timers: NodeJS.Timeout[],
    listeners: { element: any; event: string; handler: any }[]
  ) => {
    // Clear all timers
    timers.forEach(timer => clearTimeout(timer));
    
    // Remove all event listeners
    listeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    
    // Reset iframe if exists
    if (iframe) {
      try {
        iframe.src = 'about:blank';
      } catch (error) {
        console.error('[VideoUtils] Error cleaning up iframe:', error);
      }
    }
    
    console.log('[VideoUtils] Video resources cleaned up');
  };
  
  // Video iframe replacement utility
  export const replaceIframeWithPlaceholder = (
    iframe: HTMLIFrameElement,
    imageUrl: string,
    title: string,
    onRestore?: () => void
  ): HTMLElement => {
    const placeholder = document.createElement('div');
    placeholder.style.cssText = `
      position: relative;
      width: 100%;
      height: 100%;
      background: url('${imageUrl}') center/cover;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    `;
    
    placeholder.innerHTML = `
      <div style="
        background: rgba(0, 0, 0, 0.6);
        color: white;
        padding: 1rem;
        border-radius: 8px;
        text-align: center;
      ">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">▶</div>
        <div style="font-size: 0.9rem;">Click to restore video</div>
      </div>
    `;
    
    if (onRestore) {
      placeholder.addEventListener('click', onRestore);
    }
    
    // Replace iframe with placeholder
    const parent = iframe.parentNode;
    if (parent) {
      parent.replaceChild(placeholder, iframe);
    }
    
    return placeholder;
  };
  
  // Export all utilities as a single object for easier importing
  export const VideoPreviewUtils = {
    stopAllVideos,
    controlYouTubeIframe,
    controlCloudflareIframe,
    detectVideoPlatform,
    extractVideoId,
    formatPreviewTime,
    calculatePreviewProgress,
    shouldBlockVideo,
    createVideoMessageListener,
    createPreviewBlockerOverlay,
    cleanupVideoResources,
    replaceIframeWithPlaceholder
  };