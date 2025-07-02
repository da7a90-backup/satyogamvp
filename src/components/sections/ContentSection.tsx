
// components/sections/ContentSection.tsx (Updated)
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface ContentSectionProps {
  eyebrow?: string;
  heading: string;
  content: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  imagePosition?: 'left' | 'right';
  imageUrl?: string;
  galleryImages?: string[];
  backgroundColor?: 'white' | 'light' | 'neutral';
}

const ContentSection: React.FC<ContentSectionProps> = ({
  eyebrow,
  heading,
  content,
  primaryButtonText,
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink,
  imagePosition = 'right',
  imageUrl,
  galleryImages,
  backgroundColor = 'white'
}) => {
  const bgClass = {
    white: 'bg-white',
    light: 'bg-gray-50',
    neutral: 'bg-gray-100'
  }[backgroundColor];

  const hasGallery = galleryImages && galleryImages.length > 0;
  const displayImage = imageUrl || (hasGallery ? galleryImages[0] : '');

  return (
    <section className={`py-16 lg:py-24 ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
          imagePosition === 'left' ? '' : 'lg:grid-flow-col-dense'
        }`}>
          {/* Content */}
          <div className={imagePosition === 'left' ? 'lg:col-start-2' : ''}>
            {eyebrow && (
              <p className="text-sm font-medium tracking-wide uppercase text-amber-600 mb-4">
                {eyebrow}
              </p>
            )}
            
            <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6">
              {heading}
            </h2>
            
            <div 
              className="prose prose-lg text-gray-700 mb-8"
              dangerouslySetInnerHTML={{ __html: content }}
            />
            
            <div className="flex flex-col sm:flex-row gap-4">
              {primaryButtonText && primaryButtonLink && (
                <Link
                  href={primaryButtonLink}
                  className="inline-flex items-center px-6 py-3 bg-amber-800 text-white font-medium rounded-md hover:bg-amber-900 transition-colors duration-200"
                >
                  {primaryButtonText}
                </Link>
              )}
              
              {secondaryButtonText && secondaryButtonLink && (
                <Link
                  href={secondaryButtonLink}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors duration-200"
                >
                  {secondaryButtonText}
                </Link>
              )}
            </div>
          </div>
          
          {/* Image/Gallery */}
          {displayImage && (
            <div className={imagePosition === 'left' ? 'lg:col-start-1' : ''}>
              {hasGallery && galleryImages.length > 1 ? (
                // Gallery Layout
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                      <Image
                        src={galleryImages[0]}
                        alt="Gallery image 1"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    </div>
                    {galleryImages[2] && (
                      <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                        <Image
                          src={galleryImages[2]}
                          alt="Gallery image 3"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    {galleryImages[1] && (
                      <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                        <Image
                          src={galleryImages[1]}
                          alt="Gallery image 2"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      </div>
                    )}
                    {galleryImages[3] && (
                      <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                        <Image
                          src={galleryImages[3]}
                          alt="Gallery image 4"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Single Image
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                  <Image
                    src={displayImage}
                    alt={heading}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContentSection;