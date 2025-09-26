'use client';

import { useState } from 'react';

const WhatWillYouEncounterSection = () => {
  const [selectedTab, setSelectedTab] = useState('Kitchen');
  const [currentKitchenImage, setCurrentKitchenImage] = useState(0);
  const [currentAccommodationImage, setCurrentAccommodationImage] = useState(0);
  const [currentCommunityImage, setCurrentCommunityImage] = useState(0);

  // Kitchen carousel images
  const kitchenImages = [
    { image: '/kitchen1.jpg', alt: 'Vegetarian meal preparation' },
    { image: '/kitchen2.jpg', alt: 'Kitchen staff cooking' },
    { image: '/kitchen3.jpg', alt: 'Fresh garden ingredients' },
    { image: '/kitchen4.jpg', alt: 'Community dining' },
    { image: '/kitchen5.jpg', alt: 'Community dining' },
    { image: '/kitchen6.jpg', alt: 'Community dining' },
    { image: '/kitchen7.jpg', alt: 'Community dining' },
    { image: '/kitchen8.jpg', alt: 'Community dining' },
    { image: '/kitchen9.jpg', alt: 'Community dining' }

  ];

  // Accommodation carousel images
  const accommodationImages = [
    { image: '/accom1.jpg', alt: 'Aerial view of ashram grounds' },
    { image: '/accom2.jpg', alt: 'Traditional ashram building' },
    { image: '/accom3.jpg', alt: 'Comfortable bedroom interior' },
    { image: '/accom4.jpg', alt: 'Peaceful accommodation exterior' },
    { image: '/accom5.jpg', alt: 'Peaceful accommodation exterior' },
    { image: '/accom6.jpg', alt: 'Peaceful accommodation exterior' },
    { image: '/accom7.jpg', alt: 'Peaceful accommodation exterior' }
  ];

  // Community carousel images
  const communityImages = [
    { image: '/community1.jpg', alt: 'Community gathering activities' },
    { image: '/community2.jpg', alt: 'Meditation and spiritual practice' },
    { image: '/community3.jpg', alt: 'Group music and celebration' },
    { image: '/community4.jpg', alt: 'Community sharing time' },
    { image: '/community5.jpg', alt: 'Community sharing time' },
    { image: '/community6.jpg', alt: 'Community sharing time' },
    { image: '/community7.jpg', alt: 'Community sharing time' }
  ];

  const getCurrentImages = () => {
    switch(selectedTab) {
      case 'Kitchen': return kitchenImages;
      case 'Accommodations': return accommodationImages;
      case 'Community': return communityImages;
      default: return kitchenImages;
    }
  };

  const getCurrentImageIndex = () => {
    switch(selectedTab) {
      case 'Kitchen': return currentKitchenImage;
      case 'Accommodations': return currentAccommodationImage;
      case 'Community': return currentCommunityImage;
      default: return 0;
    }
  };

  const setCurrentImageIndex = (index:any) => {
    switch(selectedTab) {
      case 'Kitchen': setCurrentKitchenImage(index); break;
      case 'Accommodations': setCurrentAccommodationImage(index); break;
      case 'Community': setCurrentCommunityImage(index); break;
    }
  };

  const nextImage = () => {
    const images = getCurrentImages();
    const currentIndex = getCurrentImageIndex();
    const maxVisibleImages = Math.min(3, images.length);
    const maxIndex = Math.max(0, images.length - maxVisibleImages);
    setCurrentImageIndex(Math.min(maxIndex, currentIndex + 1));
  };

  const prevImage = () => {
    const currentIndex = getCurrentImageIndex();
    setCurrentImageIndex(Math.max(0, currentIndex - 1));
  };

  const renderTabContent = () => {
    const images = getCurrentImages();
    const currentIndex = getCurrentImageIndex();
    
    switch(selectedTab) {
      case 'Kitchen':
        return (
          <div className="w-full flex flex-col items-center gap-8">
            <div className="text-center max-w-4xl">
              <h3 
                className="mb-4"
                style={{
                  fontFamily: 'Optima, sans-serif',
                  fontSize: '32px',
                  fontWeight: 550,
                  color: '#000000'
                }}
              >
                Ruchira – Our Ashram Kitchen
              </h3>
              <p 
                className="mb-6"
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '18px',
                  lineHeight: '28px',
                  color: '#384250'
                }}
              >
                Our vegetarian kitchen prepares every meal as a celebration of delight and vitality, with the freshest ingredients from our gardens, food forests, and local farms. Every morning, we harvest radiant greens, ripe vegetables, and nourishing roots, which are carefully prepared to infuse your body with prana-filled sustenance. Berries flourish in abundance, and fragrant herbs enhance every dish. What we do not yet grow ourselves, we source from trusted local farmers and markets, ensuring that every meal supports your physical renewal and psychospiritual transformation.
              </p>
              <button
                className="px-6 py-3 text-white rounded-lg font-medium transition-colors duration-300 hover:opacity-90"
                style={{
                  backgroundColor: '#7D1A13',
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '16px'
                }}
              >
                Discover our recipes
              </button>
            </div>
          </div>
        );
      
      case 'Accommodations':
        return (
          <div className="w-full flex flex-col items-center gap-8">
            <div className="text-center max-w-4xl">
              <h3 
                className="mb-4"
                style={{
                  fontFamily: 'Optima, sans-serif',
                  fontSize: '32px',
                  fontWeight: 550,
                  color: '#000000'
                }}
              >
                Accommodations – Nature is Our Neighbor
              </h3>
              <p 
                className="mb-6"
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '18px',
                  lineHeight: '28px',
                  color: '#384250'
                }}
              >
                Your retreat experience is enhanced by the serene beauty of our mountain sanctuary, where lush forests, flowering gardens, and fruit-laden trees create a living mandala of divine power. Our accommodations, nestled in the heart of the Ashram, are designed for simple comfort and tranquillity, offering a personal space where you can unwind and attune to the rhythms of nature. Each room features a private bathroom, and opens onto a balcony from which you can gaze upon the far horizons, inhale the healing fragrances of the land, and listen to the symphony of birdsong that accompanies each new day.
              </p>
            </div>
          </div>
        );
      
      case 'Community':
        return (
          <div className="w-full flex flex-col items-center gap-8">
            <div className="text-center max-w-4xl">
              <h3 
                className="mb-4"
                style={{
                  fontFamily: 'Optima, sans-serif',
                  fontSize: '32px',
                  fontWeight: 550,
                  color: '#000000'
                }}
              >
                Connect with the Community – A Tribal Gathering
              </h3>
              <p 
                className="mb-6"
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '18px',
                  lineHeight: '28px',
                  color: '#384250'
                }}
              >
                The Sat Yoga Ashram is a meeting place for souls on the path of Truth beyond the grasp of the ego mind—a vibrant confluence of seekers from all over the world. Here, you will find yourself saturated by a morphic field of love, wisdom, and deep spiritual camaraderie, nurtured by the luminous presence of Shunyamurti and a dedicated sangha living in harmonious simplicity. Whether sharing in uplifting satsangs, engaging in profound conversations, or simply being held in silent resonance, you will feel supported in every stage of your healing and transmutation.
              </p>
              <button
                className="px-6 py-3 text-white rounded-lg font-medium transition-colors duration-300 hover:opacity-90"
                style={{
                  backgroundColor: '#7D1A13',
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '16px'
                }}
              >
                Learn more
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <section 
      className="relative w-full flex flex-col items-center py-16 lg:py-28 px-4 lg:px-16"
      style={{ backgroundColor: '#FAF8F1' }}
    >
      <div className="w-full flex flex-col items-center" style={{ maxWidth: '1312px', gap: '40px' }}>
        <h2 
          className="text-center"
          style={{
            fontFamily: 'Optima, Georgia, serif',
            fontSize: 'clamp(28px, 4vw, 48px)',
            fontWeight: 550,
            lineHeight: '125%',
            letterSpacing: '-0.02em',
            color: '#000000'
          }}
        >
          What Will You Encounter?
        </h2>

        {/* Tabs */}
        <div className="flex items-center gap-8 border-b border-gray-200">
          {['Community', 'Kitchen', 'Accommodations'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`pb-4 px-2 font-medium transition-colors ${
                selectedTab === tab 
                  ? 'border-b-2 text-red-800' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              style={{ 
                fontFamily: 'Avenir Next, sans-serif', 
                fontSize: '16px',
                borderBottomColor: selectedTab === tab ? '#7D1A13' : 'transparent'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Image Carousel */}
        <div className="relative w-full overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${getCurrentImageIndex() * 33.33}%)`,
            }}
          >
            {getCurrentImages().map((item, index) => (
              <div 
                key={`${selectedTab}-${index}`}
                className="flex-shrink-0"
                style={{ width: '33.33%', padding: '0 16px' }}
              >
                <div 
                  className="w-full rounded-xl overflow-hidden"
                  style={{ aspectRatio: '4/3', backgroundColor: '#f3f4f6' }}
                >
                  <img
                    src={item.image}
                    alt={item.alt}
                    className="w-full h-full object-cover"
                    onError={(e:any) => {
                      e.target.style.backgroundColor = '#e5e7eb';
                      e.target.style.display = 'flex';
                      e.target.style.alignItems = 'center';
                      e.target.style.justifyContent = 'center';
                      e.target.innerHTML = `<span style="color: #6b7280; font-size: 14px; text-align: center;">${item.alt}</span>`;
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Navigation */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 ml-4">
            {getCurrentImages().map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  getCurrentImageIndex() === index ? 'bg-gray-800' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={prevImage}
              className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors duration-300"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 15l-5-5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={nextImage}
              className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors duration-300"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15l5-5-5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatWillYouEncounterSection;