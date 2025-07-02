// components/sections/QuoteSection.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface QuoteSectionProps {
  eyebrow?: string;
  quote: string;
  authorName: string;
  authorTitle?: string;
  authorImage: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundColor?: 'light' | 'dark' | 'neutral';
}

const QuoteSection: React.FC<QuoteSectionProps> = ({
  eyebrow,
  quote,
  authorName,
  authorTitle,
  authorImage,
  description,
  buttonText,
  buttonLink,
  backgroundColor = 'light'
}) => {
  const bgClass = {
    light: 'bg-gray-50',
    dark: 'bg-gray-900 text-white',
    neutral: 'bg-white'
  }[backgroundColor];

  return (
    <section className={`py-16 lg:py-24 ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="order-2 lg:order-1">
            {eyebrow && (
              <p className="text-sm font-medium tracking-wide uppercase text-amber-600 mb-4">
                {eyebrow}
              </p>
            )}
            
            <blockquote className="text-3xl lg:text-4xl font-light leading-tight mb-8">
              "{quote}"
            </blockquote>
            
            <div className="mb-6">
              <p className="text-lg font-medium">{authorName}</p>
              {authorTitle && (
                <p className="text-base text-gray-600">{authorTitle}</p>
              )}
            </div>
            
            {description && (
              <div className="space-y-4 mb-8">
                {description.split('\n').map((paragraph, index) => (
                  <p key={index} className="text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
            
            {buttonText && buttonLink && (
              <Link
                href={buttonLink}
                className="inline-flex items-center px-6 py-3 bg-amber-800 text-white font-medium rounded-md hover:bg-amber-900 transition-colors duration-200"
              >
                {buttonText}
              </Link>
            )}
          </div>
          
          {/* Author Image */}
          <div className="order-1 lg:order-2">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
              <Image
                src={authorImage}
                alt={authorName}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuoteSection;