import React from 'react';

// TypeScript interfaces for data structure
interface GalleryImage {
  src: string;
  alt: string;
  size?: 'small' | 'medium' | 'large';
}

interface PhotoGallerySectionData {
  images: GalleryImage[];
}

interface PhotoGallerySectionProps {
  data: PhotoGallerySectionData;
}

export default function PhotoGallerySection({ data }: PhotoGallerySectionProps) {
  return (
    <div
      style={{
        background: '#FAF8F1',
        padding: '80px 64px'
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px'
        }}
      >
        {data.images.map((image, index) => (
          <div
            key={index}
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '8px',
              aspectRatio: '4/3',
              cursor: 'pointer',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <img
              src={image.src}
              alt={image.alt}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}