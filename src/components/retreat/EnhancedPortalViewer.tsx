'use client';

import { useState } from 'react';
import { Play, Calendar, Clock, Video, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PortalMedia {
  youtube: string[];
  vimeo: string[];
  cloudflare: string[];
  mp4: string[];
  mp3: string[];
}

interface Session {
  date?: string;
  time?: string;
  session_title: string;
  description?: string;
  type?: string;
  duration?: number;
  has_audio?: boolean;
  has_video?: boolean;
  teaching_id?: string;
  youtube_live_id?: string;
  thumbnail_url?: string;
  zoom_link?: string;
  is_text?: boolean;
}

interface Day {
  title: string;
  day_number: number;
  date?: string;
  day_label?: string;
  sessions: Session[];
}

interface RetreatPortal {
  id: string;
  title: string;
  description?: string;
  content: {
    days: Day[];
  };
  order_index: number;
}

interface RetreatData {
  id: string;
  slug: string;
  title: string;
  description?: string;
  type: string;
  start_date?: string;
  end_date?: string;
  portals: RetreatPortal[];
}

interface EnhancedPortalViewerProps {
  productTitle: string;
  portalMedia: PortalMedia;
  retreatData: RetreatData;
}

export function EnhancedPortalViewer({
  productTitle,
  portalMedia,
  retreatData
}: EnhancedPortalViewerProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedSessionIndex, setSelectedSessionIndex] = useState(0);
  const [mediaType, setMediaType] = useState<'video' | 'audio'>('video');

  // Get all days from all portals
  const allDays: Day[] = retreatData.portals.flatMap(portal => portal.content?.days || []);

  if (allDays.length === 0) {
    // No structured portal, just show message
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <p className="text-[#717680]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
          Retreat portal structure coming soon. Check back later!
        </p>
      </div>
    );
  }

  const currentDay = allDays[selectedDayIndex];
  const currentSession = currentDay?.sessions[selectedSessionIndex];

  // Get all media URLs
  const allVideos = [
    ...portalMedia.youtube.map(url => ({ type: 'youtube' as const, url })),
    ...portalMedia.vimeo.map(url => ({ type: 'vimeo' as const, url })),
    ...portalMedia.cloudflare.map(url => ({ type: 'cloudflare' as const, url })),
    ...portalMedia.mp4.map(url => ({ type: 'mp4' as const, url })),
  ];

  const allAudios = portalMedia.mp3.map((url, i) => ({ url, title: `Audio ${i + 1}` }));

  const getEmbedUrl = (item: any) => {
    if (item.type === 'youtube') {
      const videoId = item.url.includes('youtu.be')
        ? item.url.split('/').pop()?.split('?')[0]
        : new URL(item.url).searchParams.get('v');
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (item.type === 'vimeo') {
      const videoId = item.url.split('/').pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return item.url;
  };

  // Try to get media for current session
  const getSessionMedia = () => {
    if (currentSession?.youtube_live_id) {
      return {
        type: 'youtube',
        url: `https://www.youtube.com/embed/${currentSession.youtube_live_id}`
      };
    }

    if (currentSession?.teaching_id && allVideos.length > 0) {
      // Try to match teaching_id with video
      return allVideos[0]; // For now, show first video
    }

    return null;
  };

  const sessionMedia = getSessionMedia();

  return (
    <div className="space-y-6">
      {/* Day Tabs */}
      <div className="bg-white rounded-lg shadow-sm p-2">
        <div className="flex gap-2 overflow-x-auto">
          {allDays.map((day, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedDayIndex(index);
                setSelectedSessionIndex(0);
              }}
              className={`flex-shrink-0 px-6 py-3 rounded-lg font-semibold transition-all ${
                selectedDayIndex === index
                  ? 'bg-[#7D1A13] text-white shadow-md'
                  : 'bg-gray-100 text-[#717680] hover:bg-gray-200'
              }`}
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              <div className="text-center">
                <div className="text-sm font-bold">{day.title}</div>
                {day.day_label && (
                  <div className="text-xs opacity-80">{day.day_label}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold text-[#000000] mb-4" style={{ fontFamily: 'Optima, serif' }}>
              Sessions
            </h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {currentDay?.sessions.map((session, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedSessionIndex(index)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedSessionIndex === index
                      ? 'bg-[#7D1A13] text-white border-[#7D1A13] shadow-md'
                      : 'bg-white hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      selectedSessionIndex === index
                        ? 'bg-white/20'
                        : 'bg-[#7D1A13]/10'
                    }`}>
                      {session.has_video ? (
                        <Video className={`w-5 h-5 ${selectedSessionIndex === index ? 'text-white' : 'text-[#7D1A13]'}`} />
                      ) : (
                        <Music className={`w-5 h-5 ${selectedSessionIndex === index ? 'text-white' : 'text-[#7D1A13]'}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm mb-1 ${selectedSessionIndex === index ? 'text-white' : 'text-[#000000]'}`} style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                        {session.session_title}
                      </p>
                      {session.time && (
                        <div className={`flex items-center gap-1 text-xs mb-1 ${selectedSessionIndex === index ? 'text-white/80' : 'text-[#717680]'}`}>
                          <Clock className="w-3 h-3" />
                          <span>{session.time}</span>
                        </div>
                      )}
                      {session.duration && (
                        <div className={`text-xs ${selectedSessionIndex === index ? 'text-white/70' : 'text-[#717680]'}`}>
                          {session.duration} minutes
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Media Player */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#000000] mb-2" style={{ fontFamily: 'Optima, serif' }}>
                {currentSession?.session_title || 'Select a session'}
              </h2>
              {currentSession?.description && (
                <p className="text-[#717680]" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                  {currentSession.description}
                </p>
              )}
            </div>

            {/* Media Type Toggle */}
            <div className="flex gap-4 mb-6">
              {allVideos.length > 0 && (
                <Button
                  variant={mediaType === 'video' ? 'default' : 'outline'}
                  onClick={() => setMediaType('video')}
                  className={mediaType === 'video' ? 'bg-[#7D1A13] hover:bg-[#7D1A13]/90' : ''}
                  style={{ fontFamily: 'Avenir Next, sans-serif' }}
                >
                  <Video className="w-4 h-4 mr-2" />
                  Videos ({allVideos.length})
                </Button>
              )}
              {allAudios.length > 0 && (
                <Button
                  variant={mediaType === 'audio' ? 'default' : 'outline'}
                  onClick={() => setMediaType('audio')}
                  className={mediaType === 'audio' ? 'bg-[#7D1A13] hover:bg-[#7D1A13]/90' : ''}
                  style={{ fontFamily: 'Avenir Next, sans-serif' }}
                >
                  <Music className="w-4 h-4 mr-2" />
                  Audio ({allAudios.length})
                </Button>
              )}
            </div>

            {/* Media Player */}
            <div className="bg-black rounded-lg overflow-hidden mb-6">
              {mediaType === 'video' && sessionMedia ? (
                <div className="aspect-video">
                  {sessionMedia.type === 'youtube' || sessionMedia.type === 'vimeo' ? (
                    <iframe
                      src={sessionMedia.url || getEmbedUrl(sessionMedia)}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  ) : (
                    <video src={sessionMedia.url} controls className="w-full h-full" />
                  )}
                </div>
              ) : mediaType === 'video' && allVideos.length > 0 ? (
                <div className="aspect-video">
                  {allVideos[0].type === 'youtube' || allVideos[0].type === 'vimeo' ? (
                    <iframe
                      src={getEmbedUrl(allVideos[0])}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  ) : (
                    <video src={allVideos[0].url} controls className="w-full h-full" />
                  )}
                </div>
              ) : mediaType === 'audio' && allAudios.length > 0 ? (
                <div className="p-8 flex items-center justify-center bg-gradient-to-br from-[#7D1A13] to-[#5D1410]">
                  <div className="text-center text-white w-full">
                    <Music className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-lg mb-4" style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                      {currentSession?.session_title || 'Audio Content'}
                    </p>
                    <audio src={allAudios[0].url} controls className="w-full max-w-md mx-auto" />
                  </div>
                </div>
              ) : (
                <div className="aspect-video flex items-center justify-center bg-gray-900">
                  <div className="text-center text-gray-400">
                    <Play className="w-16 h-16 mx-auto mb-4" />
                    <p style={{ fontFamily: 'Avenir Next, sans-serif' }}>
                      No media available for this session
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Session Info */}
            {currentSession && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                {currentSession.date && (
                  <div className="flex items-center gap-2 text-sm text-[#717680]">
                    <Calendar className="w-4 h-4" />
                    <span style={{ fontFamily: 'Avenir Next, sans-serif' }}>{currentSession.date}</span>
                  </div>
                )}
                {currentSession.time && (
                  <div className="flex items-center gap-2 text-sm text-[#717680]">
                    <Clock className="w-4 h-4" />
                    <span style={{ fontFamily: 'Avenir Next, sans-serif' }}>{currentSession.time}</span>
                  </div>
                )}
                {currentSession.type && (
                  <div className="text-sm text-[#717680]">
                    <span className="font-semibold">Type:</span>{' '}
                    <span className="capitalize" style={{ fontFamily: 'Avenir Next, sans-serif' }}>{currentSession.type}</span>
                  </div>
                )}
                {currentSession.duration && (
                  <div className="text-sm text-[#717680]">
                    <span className="font-semibold">Duration:</span>{' '}
                    <span style={{ fontFamily: 'Avenir Next, sans-serif' }}>{currentSession.duration} minutes</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
