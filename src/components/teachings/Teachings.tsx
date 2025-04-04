'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Mock featured teaching data
const featuredTeaching = {
  date: "Nov 26th, 2024",
  duration: "6:55 minutes",
  title: "The grace of self sovereignty",
  summary: "Summary: Complementarity is the engine of time. This was well-known in ancient China, when the sages developed the paradigm of yin and yang. This is the secret of love and brings the grace of sovereignty, a dance without dependency, yet always in harmony with the whole.",
  additionalInfo: "This can result in initiation, transmission of shakti—spiritual energy—and blessings for healing and God-realization.",
  id: "featured-1"
};

// Mock teachings data
const mockTeachings = [
  {
    id: "1",
    title: "God's great reset is not what you think",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.",
    duration: "45 minutes",
    type: "free",
    imageUrl: "/placeholder-video.jpg"
  },
  {
    id: "2",
    title: "Overcoming the ego's traumas",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.",
    duration: "45 minutes",
    type: "free",
    imageUrl: "/placeholder-video.jpg"
  },
  {
    id: "3",
    title: "Take a quantum leap outside the matrix the ego's traumas",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.",
    duration: "45 minutes",
    type: "free",
    imageUrl: "/placeholder-video.jpg"
  },
  {
    id: "4",
    title: "God's great reset is not what you think",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.",
    duration: "10 minutes",
    type: "membership",
    imageUrl: "/placeholder-video.jpg"
  },
  {
    id: "5",
    title: "Overcoming the ego's traumas",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.",
    duration: "10 minutes",
    type: "membership",
    imageUrl: "/placeholder-video.jpg"
  },
  {
    id: "6",
    title: "Take a quantum leap outside the matrix the ego's traumas",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.",
    duration: "10 minutes",
    type: "membership",
    imageUrl: "/placeholder-video.jpg"
  },
  {
    id: "7",
    title: "God's great reset is not what you think",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.",
    duration: "10 minutes",
    type: "membership",
    imageUrl: "/placeholder-video.jpg"
  },
  {
    id: "8",
    title: "Overcoming the ego's traumas",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.",
    duration: "10 minutes",
    type: "membership",
    imageUrl: "/placeholder-video.jpg"
  },
  {
    id: "9",
    title: "Take a quantum leap outside the matrix the ego's traumas",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.",
    duration: "10 minutes",
    type: "membership",
    imageUrl: "/placeholder-video.jpg"
  }
];

// Teaching card component
const TeachingCard = ({ teaching, onBookmark, isLast = false }: any) => {
  return (
    <div className={`${isLast ? 'h-full' : ''}`}>
      <div className="rounded-md overflow-hidden border border-gray-300 bg-white h-full">
        <div className="relative">
          {/* Video thumbnail */}
          <div className="aspect-video bg-gray-200 relative">
            {teaching.imageUrl ? (
              <Image 
                src={teaching.imageUrl} 
                alt={teaching.title}
                width={400}
                height={225}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="w-12 h-12 rounded-full bg-white bg-opacity-80 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-800" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Type label (Free or Membership) */}
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 bg-white rounded-md text-xs font-medium">
              {teaching.type === 'free' ? 'Free' : 'Membership'}
            </span>
          </div>
          
          {/* Bookmark button */}
          <button 
            onClick={() => onBookmark(teaching.id)}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center"
            aria-label="Bookmark teaching"
          >
            <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4">
          {/* Duration */}
          <div className="flex items-center text-gray-500 text-sm mb-2">
            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span>{teaching.duration}</span>
          </div>
          
          {/* Title */}
          <h3 className="text-base font-medium mb-2">{teaching.title}</h3>
          
          {/* Description */}
          <p className="text-sm text-gray-600">{teaching.description}</p>
        </div>
      </div>
    </div>
  );
};

// Featured teaching component
const FeaturedTeaching = ({ teaching }: any) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden mb-10 shadow-sm border border-gray-200">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3 aspect-video bg-gray-200 relative">
          {/* Placeholder image */}
          <Image 
            src="/placeholder-video.jpg" 
            alt="Featured video"
            width={400}
            height={225}
            className="w-full h-full object-cover"
          />
          
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button className="w-16 h-16 rounded-full bg-white bg-opacity-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-800" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-6 md:w-2/3">
          <div className="text-sm text-gray-600 mb-1">{teaching.date}</div>
          <div className="flex items-center text-gray-600 text-sm mb-3">
            <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span>{teaching.duration}</span>
          </div>
          
          <h2 className="text-xl font-bold mb-3">{teaching.title}</h2>
          <p className="text-gray-700 mb-4">{teaching.summary}</p>
          <p className="text-gray-700 mb-4">{teaching.additionalInfo}</p>
          
          <button className="px-4 py-2 bg-gray-100 rounded-md text-gray-800 hover:bg-gray-200 transition-colors">
            View
          </button>
        </div>
      </div>
    </div>
  );
};

// Library Hero Component
const LibraryHero = () => {
    return (
      <div className="relative bg-gray-700 text-white py-40 md:py-60 mb-12">
        {/* Hero background image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/placeholder.png" 
            alt="Library background"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-black opacity-60"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4 text-center flex flex-col justify-center h-full">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8">A Sample of Our Wisdom School</h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto">
            For many years, we have had the privilege of sharing an abundance of Shunyamurti's teachings freely with the world, and
            wish to continue the mission of disseminating these priceless offerings to all who are attuned to the truth and wisdom
          </p>
        </div>
      </div>
    );
  };

// Main Teaching Library Page Component
const TeachingLibraryPage = () => {
  const [activeFilter, setActiveFilter] = useState('Teachings');
  const [bookmark, setBookmark] = useState(null);
  const totalItems = 480;

  const handleFilterChange = (filter: any) => {
    setActiveFilter(filter);
  };

  const handleBookmark = (id: any) => {
    setBookmark(id);
    console.log(`Bookmarked teaching: ${id}`);
  };
  

  return (
    <div className="bg-gray-100 min-h-screen pb-20">
      <LibraryHero />
      
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Latest Teaching</h2>
          <Link href="/teachings" className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm">
            View all
          </Link>
        </div>
        
        <FeaturedTeaching teaching={featuredTeaching} />
        
        {/* Category Tabs */}
        <div className="border-b border-gray-300 mb-6">
          <div className="flex overflow-x-auto">
            {['Teachings', 'Guided Meditations', 'Q&A with Shunyamurti', 'Essay'].map((filter) => (
              <button
                key={filter}
                onClick={() => handleFilterChange(filter)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                  activeFilter === filter
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        
        {/* Filter Controls */}
        <div className="flex flex-wrap justify-between items-center mb-6">
          <div className="text-sm text-gray-600">{totalItems} items</div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <button className="flex items-center py-2 px-3 text-sm border border-gray-300 rounded-md bg-white">
                <span className="mr-2">Sort by</span>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            
            <button className="py-2 px-3 text-sm border border-gray-300 rounded-md bg-white flex items-center">
              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </button>
          </div>
        </div>
        
        {/* Teaching Grid with overlay */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative mb-40">
          {/* First two rows (6 items) */}
          {mockTeachings.slice(0, 6).map((teaching) => (
            <TeachingCard 
              key={teaching.id} 
              teaching={teaching} 
              onBookmark={handleBookmark}
            />
          ))}
          
          {/* Last row (3 items) - will be partially covered by overlay */}
          {mockTeachings.slice(6, 9).map((teaching, index) => (
            <TeachingCard 
              key={teaching.id} 
              teaching={teaching} 
              onBookmark={handleBookmark}
            />
          ))}
          
          {/* Full-width overlay with gradient transparency at top */}
          <div className="absolute top-[920px] left-0 right-0 w-full py-16"
               style={{
                 width: '100vw',
                 position: 'absolute',
                 left: '50%',
                 transform: 'translateX(-50%)',
                 zIndex: 999,
                 height: 'calc(100vh - 920px)', // Extend to bottom of viewport
                 background: 'linear-gradient(to bottom, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.95) 70px, rgba(255,255,255,1) 150px)'
               }}>
            <div className="mx-auto max-w-3xl px-4 text-center pt-12">
              <h2 className="text-3xl font-bold mb-4">Continue browsing our free library</h2>
              <p className="text-gray-600 mb-8">Gain access to 500+ publications, exclusive content, and a free meditation course</p>
              
              <div className="max-w-md mx-auto space-y-3">
                <button className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50">
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064 5.963 5.963 0 014.23 1.74l2.694-2.689A9.99 9.99 0 0012.545 2.001a10.089 10.089 0 00-9.286 6.255 10.034 10.034 0 003.7 12.66 10.003 10.003 0 005.586 1.694c7.058 0 11.668-5.736 10.924-12.01l-10.924-.36z" />
                  </svg>
                  Sign in with Google
                </button>
                
                <button className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50">
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.007 3H3.993A.993.993 0 003 3.993v16.014c0 .549.444.993.993.993h8.628v-6.961h-2.343v-2.813h2.343V9.312c0-2.325 1.42-3.591 3.494-3.591.993 0 1.847.073 2.096.106v2.43h-1.44c-1.125 0-1.345.532-1.345 1.315v1.723h2.689l-.35 2.813h-2.339V21h4.573a.993.993 0 00.993-.993V3.993A.993.993 0 0020.007 3z" />
                  </svg>
                  Sign in with Facebook
                </button>
                
                <button className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50">
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.45-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.47C2.79 15.22 3.51 7.89 8.42 7.56c1.57.05 2.62 1.06 3.54 1.1 1.35-.18 2.63-1.16 4.11-1.22.7.01 2.65.27 3.91 2.08-3.34 2.13-2.79 6.17.55 7.83-2.25 3.96-4.51 4.13-3.86 2.44.41-1.08 1.67-1.72 1.67-1.72-1.5-.92-1.82-3.32-1.29-4.79zM12.03 7.28c-.19-2.15 1.76-4 4.1-4.16.25 2.41-2.16 4.2-4.1 4.16z" />
                  </svg>
                  Sign in with Apple
                </button>
              </div>
              
              <div className="flex items-center justify-center my-4">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="px-4 text-gray-500 text-sm">OR</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>
              
              <button className="text-purple-600 font-medium hover:text-purple-800">
                Continue with email
              </button>
            </div>
          </div>
        </div>
          
        </div>
      </div>
  );
};

export default TeachingLibraryPage;