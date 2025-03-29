'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface TabContent {
  id: string;
  label: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  imageUrl?: string;
}

interface TabContentProps {
  content: TabContent;
  isActive: boolean;
}

const TabContent: React.FC<TabContentProps> = ({ content, isActive }) => {
  if (!isActive) return null;
  
  return (
    <div className="p-6 bg-white rounded-b-lg border-t border-gray-100">
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div>
          <p className="text-purple-600 font-medium mb-3">{content.label}</p>
          <h3 className="text-3xl font-bold mb-4">{content.title}</h3>
          <p className="text-gray-700 mb-6">{content.description}</p>
          
          <Link 
            href={content.buttonLink} 
            className="inline-block bg-gray-900 text-white rounded-md px-6 py-3 font-medium hover:bg-gray-800"
          >
            {content.buttonText}
          </Link>
        </div>
        
        <div className="bg-gray-200 rounded-lg aspect-w-4 aspect-h-3">
          {content.imageUrl ? (
            <Image 
              src={content.imageUrl} 
              alt={content.title} 
              fill
              className="object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
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
  );
};

interface LearningTabsProps {
  title?: string;
  description?: string;
  tabs?: TabContent[];
}

const LearningTabs: React.FC<LearningTabsProps> = ({
  title = "How to learn online with Sat Yoga?",
  description = "Sat Yoga offers a range of online learning options to support your growth, including immersive retreats, a personalized membership with tailored content, and resources available in our store. Learn at your own pace, wherever you are.",
  tabs = [
    {
      id: 'free-teachings',
      label: 'Free teachings',
      title: 'Start Your Journey with Free Wisdom',
      description: 'Explore our selection of free teachings and get a taste of the transformative content offered at Sat Yoga. These accessible resources are designed to introduce you to key principles of healing, mindfulness, and personal growth, helping you begin or deepen your journey.',
      buttonText: 'Browse teachings',
      buttonLink: '/learn/free-teachings',
      imageUrl: '',
    },
    {
      id: 'membership',
      label: 'Membership Section',
      title: 'Personalized Content for Your Path',
      description: 'Subscribe to our membership and gain access to exclusive content tailored to your unique journey. Enjoy custom lessons, guided practices, and resources that evolve with your needs, all in a supportive community environment.',
      buttonText: 'View memberships',
      buttonLink: '/membership',
      imageUrl: '',
    },
    {
      id: 'retreats',
      label: 'Online Retreats',
      title: 'Transformative Learning from Home',
      description: 'Join our immersive online retreats and experience the wisdom of Sat Yoga\'s teachings. These retreats provide a deep, healing journey, accessible from anywhere, designed to support your personal growth and spiritual awakening.',
      buttonText: 'Browse Retreats',
      buttonLink: '/retreats/online',
      imageUrl: '',
    },
    {
      id: 'courses',
      label: 'Courses',
      title: 'Structured Guidance for Deeper Understanding',
      description: 'Our courses offer comprehensive exploration of specific spiritual topics and practices. Each course includes video teachings, guided meditations, and practical exercises to integrate the wisdom into your daily life.',
      buttonText: 'Explore courses',
      buttonLink: '/learn/courses',
      imageUrl: '',
    },
    {
      id: 'store',
      label: 'Store',
      title: 'Tools to Enhance Your Practice',
      description: 'Browse our curated collection of items in the Sat Yoga store, including books, meditation tools, and healing resources. Each item is carefully selected to support your ongoing learning and spiritual development.',
      buttonText: 'Go to store',
      buttonLink: '/store',
      imageUrl: '',
    },
  ],
}) => {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '');
  
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };
  
  const activeContent = tabs.find(tab => tab.id === activeTab);
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-purple-600 font-medium mb-3">More Online Learning Options</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{title}</h2>
          <p className="text-gray-700">{description}</p>
        </div>
        
        {/* Tabs Navigation */}
        <div className="rounded-lg overflow-hidden mb-8 border border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`py-4 px-4 text-center font-medium transition ${
                  activeTab === tab.id
                    ? 'text-gray-900 border-b-2 border-purple-600 bg-white'
                    : 'text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border-b border-gray-200'
                }`}
                onClick={() => handleTabClick(tab.id)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Tab Content */}
          {tabs.map((tab) => (
            <TabContent
              key={tab.id}
              content={tab}
              isActive={activeTab === tab.id}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default LearningTabs;