'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';

interface FavoriteTeaching {
  id: string;
  slug: string;
  title: string;
  thumbnail_url?: string;
  content_type: string;
  access_type: string;
}

interface FavouritesClientProps {
  favorites: FavoriteTeaching[];
}

export default function FavouritesClient({ favorites: initialFavorites }: FavouritesClientProps) {
  const [activeTab, setActiveTab] = useState<'video' | 'audio' | 'text'>('video');
  const [favorites, setFavorites] = useState(initialFavorites);

  // Debug logging
  console.log('FavouritesClient - Received favorites:', initialFavorites);
  console.log('FavouritesClient - Favorites count:', initialFavorites.length);
  console.log('FavouritesClient - Content types:', initialFavorites.map(f => f.content_type));
  console.log('FavouritesClient - Active tab:', activeTab);

  // Filter teachings by content type
  const filteredTeachings = favorites.filter(teaching => {
    const contentType = teaching.content_type?.toLowerCase();
    console.log('Filtering:', teaching.title, '- Content type:', contentType, '- Active tab:', activeTab);

    if (activeTab === 'video') {
      return contentType === 'video' || contentType === 'videoandaudio' || contentType === 'video_teaching' || contentType === 'qa';
    }
    if (activeTab === 'audio') {
      return contentType === 'audio' || contentType === 'meditation' || contentType === 'guided_meditation';
    }
    if (activeTab === 'text') {
      return contentType === 'text' || contentType === 'essay';
    }
    return true;
  });

  console.log('FavouritesClient - Filtered count:', filteredTeachings.length);

  const getContentTypeLabel = (contentType: string) => {
    const lower = contentType.toLowerCase();
    if (lower === 'videoandaudio') return 'Video & Audio';
    if (lower === 'video_teaching') return 'Video';
    if (lower === 'guided_meditation') return 'Meditation';
    return contentType.charAt(0).toUpperCase() + contentType.slice(1);
  };

  return (
    <div className="min-h-screen lg:min-h-[125vh] bg-[#FAF8F1] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#000000] mb-2" style={{ fontFamily: 'Optima, serif' }}>
            My Favourites
          </h1>
          <p className="text-[#717680]">
            Easily revisit past retreats, completed courses, and previous purchases.
            Your history helps you reflect on your progress and reconnect with transformative
            teachings whenever you need them.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-[#E5E7EB] mb-6">
          <button
            onClick={() => setActiveTab('video')}
            className={`pb-3 px-1 border-b-2 transition-colors text-sm font-medium ${
              activeTab === 'video'
                ? 'border-[#7D1A13] text-[#7D1A13]'
                : 'border-transparent text-[#717680] hover:text-[#000000]'
            }`}
          >
            Video
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`pb-3 px-1 border-b-2 transition-colors text-sm font-medium ${
              activeTab === 'audio'
                ? 'border-[#7D1A13] text-[#7D1A13]'
                : 'border-transparent text-[#717680] hover:text-[#000000]'
            }`}
          >
            Audio
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`pb-3 px-1 border-b-2 transition-colors text-sm font-medium ${
              activeTab === 'text'
                ? 'border-[#7D1A13] text-[#7D1A13]'
                : 'border-transparent text-[#717680] hover:text-[#000000]'
            }`}
          >
            Text
          </button>
        </div>

        {/* Content */}
        {filteredTeachings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
              <Heart size={32} className="text-[#717680]" />
            </div>
            <h2 className="text-2xl font-bold text-[#000000] mb-2">No favourite yet</h2>
            <p className="text-[#717680] text-center max-w-md mb-8">
              Easily revisit past retreats, completed courses, and previous purchases.
              Your history helps you reflect on your progress and reconnect with transformative
              teachings whenever you need them.
            </p>
            <Link
              href="/dashboard/user/teachings"
              className="px-6 py-3 bg-[#7D1A13] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Browse Teachings
            </Link>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-[#717680]">
                {filteredTeachings.length} {filteredTeachings.length === 1 ? 'item' : 'items'}
              </p>
              <div className="flex gap-4 items-center">
                <span className="text-sm text-[#717680]">Sort by</span>
                <button className="flex items-center gap-2 px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm hover:bg-gray-50">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 5H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M4 9H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M6 13H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span>Filters</span>
                </button>
              </div>
            </div>

            {/* Teachings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeachings.map((teaching) => (
                <Link
                  key={teaching.id}
                  href={`/dashboard/user/teachings/${teaching.slug}`}
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="relative h-48 bg-gray-200">
                    {teaching.thumbnail_url ? (
                      <Image
                        src={teaching.thumbnail_url}
                        alt={teaching.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <Heart size={16} fill="#7D1A13" stroke="#7D1A13" />
                      </div>
                    </div>
                    {teaching.content_type && (
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2 py-1 bg-black/80 text-white text-xs font-semibold rounded">
                          {getContentTypeLabel(teaching.content_type)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-[#000000] mb-2 group-hover:text-[#7D1A13] transition-colors line-clamp-2">
                      {teaching.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
