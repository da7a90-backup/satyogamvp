'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PortalMedia {
  youtube: string[];
  vimeo: string[];
  cloudflare: string[];
  mp4: string[];
  mp3: string[];
}

interface PortalViewerProps {
  portalMedia: PortalMedia;
  productTitle: string;
  digitalContentUrl?: string | null; // For single-file products (audio, ebook)
}

export function PortalViewer({ portalMedia, productTitle, digitalContentUrl }: PortalViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mediaType, setMediaType] = useState<'video' | 'audio'>('video');

  // Debug: Log the portal media structure
  console.log('[PortalViewer] Portal Media:', {
    youtube: portalMedia?.youtube?.length || 0,
    mp3: portalMedia?.mp3?.length || 0,
    vimeo: portalMedia?.vimeo?.length || 0,
    cloudflare: portalMedia?.cloudflare?.length || 0,
    mp4: portalMedia?.mp4?.length || 0,
  });
  console.log('[PortalViewer] digitalContentUrl:', digitalContentUrl);

  const allVideos = [
    ...(portalMedia?.youtube || []).map(url => ({ type: 'youtube' as const, url })),
    ...(portalMedia?.vimeo || []).map(url => ({ type: 'vimeo' as const, url })),
    ...(portalMedia?.cloudflare || []).map(url => ({ type: 'cloudflare' as const, url })),
    ...(portalMedia?.mp4 || []).map(url => ({ type: 'mp4' as const, url })),
  ];

  // Build audio list: include digital_content_url if present, plus any mp3s in portal_media
  // Check if digital_content_url is a PDF
  const isPDF = digitalContentUrl?.toLowerCase().endsWith('.pdf');

  const allAudios = [
    ...(digitalContentUrl && !isPDF ? [{ url: digitalContentUrl, title: productTitle }] : []),
    ...(portalMedia?.mp3 || []).map((url, i) => ({ url, title: `Audio ${i + 1}` }))
  ];

  const currentMedia = mediaType === 'video' ? allVideos : allAudios;
  const totalItems = currentMedia.length;

  console.log('[PortalViewer] Total videos:', allVideos.length, 'Total audios:', allAudios.length);
  console.log('[PortalViewer] isPDF:', isPDF, 'PDF URL:', digitalContentUrl);

  const getEmbedUrl = (item: any) => {
    if (item.type === 'youtube') {
      // Fix: Handle query parameters properly
      const videoId = item.url.includes('youtu.be')
        ? item.url.split('/').pop().split('?')[0]
        : new URL(item.url).searchParams.get('v');
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      console.log('[PortalViewer] YouTube embed URL:', embedUrl);
      return embedUrl;
    }
    if (item.type === 'vimeo') {
      const videoId = item.url.split('/').pop().split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return item.url;
  };

  const goNext = () => setCurrentIndex((i) => (i + 1) % totalItems);
  const goPrev = () => setCurrentIndex((i) => (i - 1 + totalItems) % totalItems);

  console.log('[PortalViewer] ===== RENDERING =====');
  console.log('[PortalViewer] mediaType:', mediaType);
  console.log('[PortalViewer] currentIndex:', currentIndex);
  console.log('[PortalViewer] totalItems:', totalItems);

  // If it's a PDF ebook, display PDF viewer
  if (isPDF && digitalContentUrl) {
    console.log('[PortalViewer] Displaying PDF viewer for:', digitalContentUrl);
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="font-semibold text-lg" style={{ fontFamily: 'Optima, serif' }}>{productTitle}</h3>
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Avenir Next, sans-serif' }}>PDF Document</p>
          </div>
          <div className="aspect-[3/4] max-h-[800px]">
            <iframe
              src={digitalContentUrl}
              className="w-full h-full"
              title={productTitle}
            />
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <a
              href={digitalContentUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-[#8B7355] text-white rounded-md hover:bg-[#6B5545] transition-colors"
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              Download PDF
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (totalItems === 0) {
    console.log('[PortalViewer] ❌ NO ITEMS TO DISPLAY');
    return <div className="text-center py-12 bg-gray-50 rounded-lg"><p className="text-gray-600">No media available for this product</p></div>;
  }

  console.log('[PortalViewer] Current item:', currentMedia[currentIndex]);
  if (mediaType === 'video' && allVideos[currentIndex]) {
    const embedUrl = getEmbedUrl(allVideos[currentIndex]);
    console.log('[PortalViewer] Video embed URL:', embedUrl);
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-4">
        {allVideos.length > 0 && (
          <Button variant={mediaType === 'video' ? 'default' : 'outline'} onClick={() => { setMediaType('video'); setCurrentIndex(0); }} className={mediaType === 'video' ? 'bg-[#8B7355]' : ''}>
            Videos ({allVideos.length})
          </Button>
        )}
        {allAudios.length > 0 && (
          <Button variant={mediaType === 'audio' ? 'default' : 'outline'} onClick={() => { setMediaType('audio'); setCurrentIndex(0); }} className={mediaType === 'audio' ? 'bg-[#8B7355]' : ''}>
            Audio ({allAudios.length})
          </Button>
        )}
      </div>

      <div className="bg-black rounded-lg overflow-hidden">
        {mediaType === 'video' ? (
          <div className="aspect-video">
            {(() => {
              const item = allVideos[currentIndex];
              if (item.type === 'youtube' || item.type === 'vimeo') {
                return <iframe src={getEmbedUrl(item)} className="w-full h-full" allowFullScreen />;
              }
              return <video src={item.url} controls className="w-full h-full" />;
            })()}
          </div>
        ) : (
          <div className="p-8 flex items-center justify-center bg-gradient-to-br from-[#8B7355] to-[#6B5545]">
            <div className="text-center text-white">
              <Play className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg mb-4">{allAudios[currentIndex].title}</p>
              <audio src={allAudios[currentIndex].url} controls className="w-full max-w-md" />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button onClick={goPrev} disabled={totalItems <= 1} variant="outline">
          <ChevronLeft className="w-4 h-4 mr-2" />Previous
        </Button>
        <span className="text-sm text-gray-600">{currentIndex + 1} of {totalItems}</span>
        <Button onClick={goNext} disabled={totalItems <= 1} variant="outline">
          Next<ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
        {currentMedia.map((item, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`p-3 text-left rounded-lg border transition-colors ${currentIndex === index ? 'bg-[#8B7355] text-white border-[#8B7355]' : 'bg-white hover:bg-gray-50 border-gray-200'}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Play className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Session {index + 1}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
