'use client';

import React from 'react';
import Image from 'next/image';

const ContactMap: React.FC = () => {
  // Coordinates for Perez Zeledon, Costa Rica
  const lat = 9.3543;
  const lng = -83.6424;
  const zoom = 14;
  
  // Generate OpenStreetMap URL - no API key needed
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.02}%2C${lat-0.02}%2C${lng+0.02}%2C${lat+0.02}&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <div className="w-full h-[350px] relative rounded overflow-hidden border border-gray-300 mt-10">
      {/* OpenStreetMap iframe - no API key required */}
      <iframe 
        src={mapUrl}
        width="100%" 
        height="100%" 
        frameBorder="0" 
        scrolling="no" 
        title="Satyoga location"
        className="z-0"
      />
      
      {/* Weather indicator overlay */}
      <div className="absolute bottom-4 left-4 bg-white rounded-full p-2 shadow-md flex items-center space-x-2 z-10">
        <span className="font-medium">32</span>
        <span className="text-yellow-500">Sunny</span>
      </div>
    </div>
  );
};

export default ContactMap;