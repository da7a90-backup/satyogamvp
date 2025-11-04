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
}

export function PortalViewer({ portalMedia, productTitle }: PortalViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mediaType, setMediaType] = useState<'video' | 'audio'>('video');

  const allVideos = [
    ...portalMedia.youtube.map(url => ({ type: 'youtube' as const, url })),
    ...portalMedia.vimeo.map(url => ({ type: 'vimeo' as const, url })),
    ...portalMedia.cloudflare.map(url => ({ type: 'cloudflare' as const, url })),
    ...portalMedia.mp4.map(url => ({ type: 'mp4' as const, url })),
  ];

  const allAudios = portalMedia.mp3.map((url, i) => ({ url, title: `Audio ${i + 1}` }));
  const currentMedia = mediaType === 'video' ? allVideos : allAudios;
  const totalItems = currentMedia.length;

  const getEmbedUrl = (item: any) => {
    if (item.type === 'youtube') {
      const videoId = item.url.includes('youtu.be') 
        ? item.url.split('/').pop() 
        : new URL(item.url).searchParams.get('v');
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (item.type === 'vimeo') {
      const videoId = item.url.split('/').pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return item.url;
  };

  const goNext = () => setCurrentIndex((i) => (i + 1) % totalItems);
  const goPrev = () => setCurrentIndex((i) => (i - 1 + totalItems) % totalItems);

  if (totalItems === 0) {
    return <div className="text-center py-12 bg-gray-50 rounded-lg"><p className="text-gray-600">No media available for this retreat</p></div>;
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

      <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
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
