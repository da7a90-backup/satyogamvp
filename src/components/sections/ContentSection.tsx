'use client';

import Image from 'next/image';
import Link from 'next/link';

interface Button {
  label: string;
  url?: string;
  primary?: boolean;
}

interface Subheading {
  title: string;
  content: string;
}

interface ContentSectionProps {
  eyebrow?: string;
  heading?: string;
  content?: string;
  bulletPoints?: string[];
  buttons?: Button[];
  imageUrl?: string;
  imageAlt?: string;
  imagePosition?: 'left' | 'right';
  subheadings?: Subheading[];
}

const ContentSection: React.FC<ContentSectionProps> = ({
  eyebrow,
  heading = "Medium length section heading goes here",
  content = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.",
  bulletPoints = [],
  buttons = [],
  imageUrl = "/placeholder.png",
  imageAlt = "Section image",
  imagePosition = "right", 
  subheadings = [],
}) => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className={`flex flex-col ${imagePosition === 'right' ? 'md:flex-row' : 'md:flex-row-reverse'} items-center md:gap-12 lg:gap-20`}>
          {/* Content Side */}
          <div className="w-full md:w-1/2 mb-10 md:mb-0">
            {eyebrow && (
              <p className="text-purple-600 font-medium mb-3">{eyebrow}</p>
            )}
            
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {heading}
            </h2>
            
            <div className="text-gray-700 mb-6">
              <p>{content}</p>
            </div>
            
            {bulletPoints.length > 0 && (
              <ul className="space-y-3 mb-8">
                {bulletPoints.map((point, index) => (
                  <li key={index} className="flex items-start">
                    <svg 
                      className="h-5 w-5 text-purple-600 mr-2 mt-0.5" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 12l2 2 4-4" 
                      />
                    </svg>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}
            
            {subheadings.length > 0 && (
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {subheadings.map((subheading, index) => (
                  <div key={index}>
                    <h3 className="text-xl font-bold mb-2">{subheading.title}</h3>
                    <p className="text-gray-700">{subheading.content}</p>
                  </div>
                ))}
              </div>
            )}
            
            {buttons.length > 0 && (
              <div className="flex flex-wrap gap-4">
                {buttons.map((button, index) => (
                  <Link 
                    key={index}
                    href={button.url || '#'}
                    className={`px-6 py-3 rounded-md font-medium ${
                      button.primary
                        ? 'bg-gray-900 text-white hover:bg-gray-800'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {button.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          {/* Image Side */}
          <div className="w-full md:w-1/2">
            <div className="aspect-w-4 aspect-h-3 bg-gray-200 rounded-lg overflow-hidden">
              {imageUrl ? (
                <Image 
                  src={imageUrl} 
                  alt={imageAlt}
                  width={500}
                  height={500}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <svg 
                    className="h-16 w-16 text-gray-400" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1} 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContentSection;