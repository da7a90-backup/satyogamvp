// components/sections/DonationSection.tsx
import React from 'react';
import Link from 'next/link';

interface DonationSectionProps {
  eyebrow?: string;
  heading: string;
  description: string;
  buttonText?: string;
  buttonLink: string;
  backgroundColor?: 'white' | 'light' | 'neutral';
}

const DonationSection: React.FC<DonationSectionProps> = ({
  eyebrow,
  heading,
  description,
  buttonText = 'Donate',
  buttonLink,
  backgroundColor = 'light'
}) => {
  const bgClass = {
    white: 'bg-white',
    light: 'bg-gray-50',
    neutral: 'bg-gray-100'
  }[backgroundColor];

  return (
    <section className={`py-16 lg:py-24 ${bgClass}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="border border-gray-200 rounded-2xl p-8 lg:p-12 bg-white">
          {eyebrow && (
            <p className="text-sm font-medium tracking-wide uppercase text-amber-600 mb-4">
              {eyebrow}
            </p>
          )}
          
          <h2 className="text-3xl lg:text-4xl font-light text-gray-900 mb-6">
            {heading}
          </h2>
          
          <p className="text-lg text-gray-700 leading-relaxed mb-8 max-w-2xl mx-auto">
            {description}
          </p>
          
          <Link
            href={buttonLink}
            className="inline-flex items-center px-8 py-3 bg-amber-800 text-white font-medium rounded-md hover:bg-amber-900 transition-colors duration-200"
          >
            {buttonText}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DonationSection;