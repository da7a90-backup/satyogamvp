'use client';

import Link from 'next/link';

interface CtaSectionProps {
  eyebrow?: string;
  heading?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  centered?: boolean;
  backgroundClass?: string;
}

const CtaSection: React.FC<CtaSectionProps> = ({
  eyebrow = "Become a member",
  heading = "Short heading here",
  description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.",
  primaryButtonText = "Button",
  primaryButtonLink = "#",
  secondaryButtonText = "",
  secondaryButtonLink = "#",
  centered = true,
  backgroundClass = "bg-white",
}) => {
  return (
    <section className={`py-16 ${backgroundClass}`}>
      <div className="container mx-auto px-4">
        <div className={`max-w-3xl ${centered ? 'mx-auto text-center' : ''}`}>
          {eyebrow && (
            <p className="text-purple-600 font-medium mb-3">{eyebrow}</p>
          )}
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {heading}
          </h2>
          
          <p className="text-gray-700 mb-8">
            {description}
          </p>
          
          <div className={`flex flex-wrap gap-4 ${centered ? 'justify-center' : ''}`}>
            <Link 
              href={primaryButtonLink}
              className="bg-gray-900 text-white rounded-md px-6 py-3 font-medium hover:bg-gray-800"
            >
              {primaryButtonText}
            </Link>
            
            {secondaryButtonText && (
              <Link 
                href={secondaryButtonLink}
                className="bg-white text-gray-700 border border-gray-300 rounded-md px-6 py-3 font-medium hover:bg-gray-50"
              >
                {secondaryButtonText}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;