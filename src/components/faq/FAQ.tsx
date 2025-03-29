'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Types
export type FAQCategory = 'General questions' | 'Kitchen' | 'Overnight guests' | 'Transportation';

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: FAQCategory;
}

// FAQ Search Bar Component
interface FAQSearchBarProps {
  onSearch: (query: string) => void;
}

const FAQSearchBar: React.FC<FAQSearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };
  
  return (
    <div className="max-w-xl mx-auto mb-8">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
          </svg>
        </div>
        <input
          type="search"
          value={query}
          onChange={handleChange}
          className="block w-full p-3 pl-10 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          placeholder="Search for answers..."
        />
      </div>
    </div>
  );
};

// FAQ Category Tabs Component
interface FAQCategoryTabsProps {
  categories: FAQCategory[];
  activeCategory: FAQCategory | 'all';
  onCategoryChange: (category: FAQCategory | 'all') => void;
}

const FAQCategoryTabs: React.FC<FAQCategoryTabsProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
}) => {
  return (
    <div className="border-b border-gray-200 mb-8">
      <div className="flex overflow-x-auto">
        <button
          onClick={() => onCategoryChange('all')}
          className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm ${
            activeCategory === 'all'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          View all
        </button>
        
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm ${
              activeCategory === category
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

// FAQ Item Component
interface FAQItemProps {
  faq: FAQ;
  isOpen: boolean;
  onToggle: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ faq, isOpen, onToggle }) => {
  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={onToggle}
        className="flex justify-between items-center w-full text-left focus:outline-none"
      >
        <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
        <span className="ml-6 flex-shrink-0">
          <svg
            className={`w-5 h-5 transform ${isOpen ? 'rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>
      
      {isOpen && (
        <div className="mt-2 text-gray-600">
          <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
        </div>
      )}
    </div>
  );
};

// Main FAQ Page Component
interface FAQPageProps {
  initialFaqs?: FAQ[];
}

export const FAQPage: React.FC<FAQPageProps> = ({ initialFaqs = [] }) => {
  const [faqs, setFaqs] = useState<FAQ[]>(initialFaqs);
  const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>(initialFaqs);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<FAQCategory | 'all'>('all');
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  
  // Get all unique categories
  const categories: FAQCategory[] = Array.from(
    new Set(faqs.map((faq) => faq.category))
  ) as FAQCategory[];
  
  // Filter FAQs based on search query and category
  useEffect(() => {
    let result = [...faqs];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query)
      );
    }
    
    if (activeCategory !== 'all') {
      result = result.filter((faq) => faq.category === activeCategory);
    }
    
    setFilteredFaqs(result);
  }, [searchQuery, activeCategory, faqs]);
  
  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  // Handle category change
  const handleCategoryChange = (category: FAQCategory | 'all') => {
    setActiveCategory(category);
  };
  
  // Handle FAQ toggle
  const handleFaqToggle = (faqId: string) => {
    setOpenFaqId((prevId) => (prevId === faqId ? null : faqId));
  };
  
  // Use mock data if no initialFaqs provided
  useEffect(() => {
    if (initialFaqs.length === 0) {
      // Mock data
      const mockFaqs: FAQ[] = [
        {
          id: '1',
          question: 'Can I come for a day trip?',
          answer: 'We are currently only hosting visitors at the ashram for a minimum stay of one month. Please read more about this program here: <b>Shakti Saturation Program</b>. We strongly encourage you to connect with our community online first to learn more about our approach before visiting.',
          category: 'General questions',
        },
        {
          id: '2',
          question: 'What is the weather like?',
          answer: 'The weather at the Ashram can be quite variable (cool and rainy to hot and humid). Mid-mornings are generally sunny and warm, with fog or no clouds coming in around noon to mid-afternoon that can produce chilly nights and mornings.<br><br>Altitude/elevation: 1500 meters (average)<br><br>All year long (rainy and dry season):<br>Average temp: 20 C° (68 F°)<br>Low temp: 15 C° (59 F°)<br>High temp: 28 C° (83 F°)',
          category: 'General questions',
        },
        {
          id: '3',
          question: 'What is your property like?',
          answer: 'We are located in the mountains of southern Costa Rica. Our land encompasses tropical cloud forests, pastures, springs, cascading rivers, organic gardens, and food forests. The terrain is hilly and forested for large expanses. Specially, we have now well cemented trails, roads, stairways that provide a variety of walking paths.',
          category: 'General questions',
        },
        {
          id: '4',
          question: 'Whom do I contact if I need more information?',
          answer: 'Please contact our Visit Coordinator.',
          category: 'General questions',
        },
        {
          id: '5',
          question: 'What languages are spoken at Sat Yoga Ashram?',
          answer: 'All our classes are offered in English though some classes and retreats will be offered with simultaneous translation into Spanish.',
          category: 'General questions',
        },
        {
          id: '6',
          question: 'How do I get to the Ashram?',
          answer: 'See our Arriving at the Ashram page for more information.',
          category: 'Transportation',
        },
        {
          id: '7',
          question: 'What is the closest airport?',
          answer: 'We recommend you fly into the San Jose Juan Santamaria International Airport (SJO).',
          category: 'Transportation',
        },
        {
          id: '8',
          question: 'Are there any scholarships available?',
          answer: 'We do not generally offer discounts to first time visitors, though we may have partial work trade opportunities for those who extend their visit beyond the first event or returning visitors if you meet the financial requirements and we have spaces available.',
          category: 'General questions',
        },
        {
          id: '9',
          question: 'How can I join the community?',
          answer: 'Joining our residential community is a deeply considered commitment, involving a minimum of two years, the acceptance of our serious seekers, looking to lead a monastic life, to begin with coming to a retreat as the first step. From this point we can discuss, in person, the process of joining our community.',
          category: 'General questions',
        },
        {
          id: '10',
          question: 'Can I bring my own food?',
          answer: 'We provide all meals during your stay. Our kitchen prepares vegetarian meals using organic produce from our garden when possible.',
          category: 'Kitchen',
        },
        {
          id: '11',
          question: 'What should I bring for my stay?',
          answer: 'We recommend bringing comfortable clothing suitable for meditation, yoga, and outdoor activities. The weather can be variable, so layers are recommended. Don\'t forget personal toiletries, a water bottle, and any medications you may need.',
          category: 'Overnight guests',
        },
      ];
      
      setFaqs(mockFaqs);
      setFilteredFaqs(mockFaqs);
    }
  }, [initialFaqs]);
  
  return (
    <div className="bg-gray-100">
      {/* Hero Section */}
      <div className="bg-gray-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">FAQs</h1>
          <FAQSearchBar onSearch={handleSearch} />
        </div>
      </div>
      
      {/* FAQ Content */}
      <div className="container mx-auto px-4 py-8">
        <FAQCategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
        
        <div className="max-w-3xl mx-auto">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No FAQs found matching your search criteria.</p>
            </div>
          ) : (
            <div className="space-y-0">
              {filteredFaqs.map((faq) => (
                <FAQItem
                  key={faq.id}
                  faq={faq}
                  isOpen={openFaqId === faq.id}
                  onToggle={() => handleFaqToggle(faq.id)}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Contact Section */}
        <div className="max-w-lg mx-auto mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="text-gray-600 mb-6">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          <Link href="/contact" className="inline-block bg-gray-900 text-white rounded-md px-6 py-3 font-medium hover:bg-gray-800">
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
};

