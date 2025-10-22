'use client'

import { useState, useMemo } from 'react';
import { Heart, X, Search } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface ProductTag {
  label: string;
  color: string;
}

interface Product {
  id: string;
  slug: string;
  title: string;
  price: number;
  image: string;
  category: string;
  tags: ProductTag[];
  featured?: boolean;
  description?: string;
  topics?: string[];
  level?: string;
  mediaType?: string;
}

interface StandardSectionData {
  tagline?: string;
  title?: string;
  description?: string;
}

interface FilterOptions {
  categories: string[];
  mediaTypes: string[];
  topics: { name: string; count: number }[];
  levels: { name: string; count: number }[];
}

// ============================================================================
// STANDARD SECTION COMPONENT
// ============================================================================

const StandardSection = ({ data }: { data: StandardSectionData }) => {
  return (
    <section 
      className="relative w-full flex flex-col items-center py-16 lg:py-28 px-4 lg:px-16"
      style={{ backgroundColor: '#FAF8F1' }}
    >
      <div 
        className="w-full flex flex-col items-center text-center"
        style={{ maxWidth: '1000px', gap: '32px' }}
      >
        {data.tagline && (
          <div className="flex items-center">
            <span 
              style={{
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                lineHeight: '24px',
                color: '#B8860B',
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
              }}
            >
              {data.tagline}
            </span>
          </div>
        )}

        {data.title && (
          <h2 
            className="text-black text-center"
            style={{
              fontFamily: 'Optima, Georgia, serif',
              fontWeight: 550,
              fontSize: 'clamp(28px, 4vw, 48px)',
              lineHeight: '125%',
              letterSpacing: '-0.02em'
            }}
          >
            {data.title}
          </h2>
        )}

        {data.description && (
          <p 
            className="text-center"
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '18px',
              lineHeight: '156%',
              color: '#384250',
              fontWeight: 400,
              maxWidth: '800px'
            }}
          >
            {data.description}
          </p>
        )}
      </div>
    </section>
  );
};

// ============================================================================
// FEATURED PRODUCT COMPONENT
// ============================================================================

const FeaturedProduct = ({ product, onSave, isLoggedIn }: { 
  product: Product; 
  onSave: () => void;
  isLoggedIn: boolean;
}) => {
  return (
    <div 
      className="flex flex-col lg:flex-row items-start w-full rounded-2xl overflow-hidden"
      style={{
        backgroundColor: '#E9EAEB',
        gap: '32px',
        padding: 'clamp(24px, 4vw, 40px)'
      }}
    >
      {/* Image */}
      <div 
        className="relative w-full lg:w-auto flex-shrink-0"
        style={{ 
          width: '100%',
          maxWidth: '280px',
          aspectRatio: '3/4'
        }}
      >
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover rounded-xl"
        />
        
        {/* Heart Icon */}
        <button
          onClick={onSave}
          className="absolute top-3 right-3 w-10 h-10 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all"
        >
          <Heart size={20} color="#000" />
        </button>

        {/* Tags */}
        <div className="absolute bottom-3 left-3 flex gap-2">
          {product.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 rounded text-xs font-semibold"
              style={{
                backgroundColor: tag.color,
                color: '#FFFFFF',
                fontFamily: 'Avenir Next, sans-serif'
              }}
            >
              {tag.label}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col" style={{ gap: '16px' }}>
        <h3
          style={{
            fontFamily: 'Optima, Georgia, serif',
            fontSize: 'clamp(24px, 3vw, 36px)',
            fontWeight: 600,
            lineHeight: '125%',
            color: '#000000'
          }}
        >
          {product.title}
        </h3>

        {product.description && (
          <p
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '16px',
              lineHeight: '24px',
              color: '#384250',
              maxWidth: '600px'
            }}
          >
            {product.description}
          </p>
        )}

        <div className="flex items-center gap-4 mt-4">
          <span
            style={{
              fontFamily: 'Optima, Georgia, serif',
              fontSize: '28px',
              fontWeight: 600,
              color: '#000000'
            }}
          >
            ${product.price.toFixed(2)}
          </span>

          <button
            onClick={() => window.location.href = `/store/${product.slug}`}
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '10px 20px',
              background: '#7D1A13',
              boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05), inset 0px 0px 0px 1px rgba(10, 13, 18, 0.18), inset 0px -2px 0px rgba(10, 13, 18, 0.05)',
              borderRadius: '8px',
              border: 'none',
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              color: '#FFFFFF',
              cursor: 'pointer'
            }}
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PRODUCT CARD COMPONENT
// ============================================================================

const ProductCard = ({ product, onSave, isLoggedIn }: { 
  product: Product; 
  onSave: () => void;
  isLoggedIn: boolean;
}) => {
  return (
    <div 
      className="flex flex-col w-full rounded-xl overflow-hidden bg-white"
      style={{
        boxShadow: '0px 1px 3px rgba(16, 24, 40, 0.1)'
      }}
    >
      {/* Image */}
      <div 
        className="relative w-full"
        style={{ aspectRatio: '3/4' }}
      >
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover"
        />
        
        {/* Heart Icon */}
        <button
          onClick={onSave}
          className="absolute top-3 right-3 w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all"
        >
          <Heart size={16} color="#000" />
        </button>

        {/* Tags */}
        <div className="absolute bottom-3 left-3 flex gap-2 flex-wrap">
          {product.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 rounded text-xs font-semibold"
              style={{
                backgroundColor: tag.color,
                color: '#FFFFFF',
                fontFamily: 'Avenir Next, sans-serif',
                fontSize: '11px'
              }}
            >
              {tag.label}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col" style={{ gap: '12px' }}>
        {/* Category */}
        <span
          style={{
            fontFamily: 'Avenir Next, sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            color: '#6B7280',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          {product.category}
        </span>

        {/* Title */}
        <h3
          style={{
            fontFamily: 'Avenir Next, sans-serif',
            fontSize: '16px',
            fontWeight: 600,
            lineHeight: '22px',
            color: '#000000',
            minHeight: '44px'
          }}
        >
          {product.title}
        </h3>

        {/* Price and Button */}
        <div className="flex items-center justify-between mt-2">
          <span
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '20px',
              fontWeight: 600,
              color: '#000000'
            }}
          >
            ${product.price.toFixed(2)}
          </span>

          <button
            onClick={() => window.location.href = `/store/${product.slug}`}
            style={{
              padding: '8px 16px',
              background: '#7D1A13',
              borderRadius: '6px',
              border: 'none',
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '13px',
              fontWeight: 600,
              color: '#FFFFFF',
              cursor: 'pointer'
            }}
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// FILTER MODAL COMPONENT
// ============================================================================

const FilterModal = ({ 
  isOpen, 
  onClose, 
  filters,
  selectedFilters,
  onFilterChange,
  onApply,
  onClear
}: {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOptions;
  selectedFilters: any;
  onFilterChange: (type: string, value: string) => void;
  onApply: () => void;
  onClear: () => void;
}) => {
  if (!isOpen) return null;

  const [searchKeyword, setSearchKeyword] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [topicSearch, setTopicSearch] = useState('');

  const filteredTopics = filters.topics.filter(topic =>
    topic.name.toLowerCase().includes(topicSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center lg:items-start lg:justify-end">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        className="relative bg-white w-full max-w-md h-full overflow-y-auto"
        style={{
          boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)'
        }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2
            style={{
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '24px',
              fontWeight: 600,
              color: '#000000'
            }}
          >
            Filters
          </h2>
          <button onClick={onClose}>
            <X size={24} color="#000" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6" style={{ gap: '32px', display: 'flex', flexDirection: 'column' }}>
          {/* Search by keyword */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#000000'
                }}
              >
                Search by keyword
              </h3>
              {searchKeyword && (
                <button
                  onClick={() => setSearchKeyword('')}
                  style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '14px',
                    color: '#6B7280',
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none'
                  }}
                >
                  Clear
                </button>
              )}
            </div>
            <div className="relative">
              <Search 
                size={18} 
                color="#9CA3AF" 
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
              />
              <input
                type="text"
                placeholder="Search"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {/* Search by price */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#000000'
                }}
              >
                Search by price
              </h3>
              {priceMax && (
                <button
                  onClick={() => setPriceMax('')}
                  style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '14px',
                    color: '#6B7280',
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none'
                  }}
                >
                  Clear
                </button>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                placeholder="1,000.00"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="w-full pl-8 pr-16 py-2 border border-gray-300 rounded-lg"
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '14px'
                }}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">USD</span>
            </div>
          </div>

          {/* Category */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#000000'
                }}
              >
                Category
              </h3>
              {selectedFilters.categories.length > 0 && (
                <button
                  onClick={() => onFilterChange('categories', 'clear')}
                  style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '14px',
                    color: '#6B7280',
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none'
                  }}
                >
                  Clear
                </button>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filters.categories.map((category) => (
                <label key={category} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFilters.categories.includes(category)}
                    onChange={() => onFilterChange('categories', category)}
                    className="w-4 h-4"
                  />
                  <span
                    style={{
                      fontFamily: 'Avenir Next, sans-serif',
                      fontSize: '14px',
                      color: '#000000'
                    }}
                  >
                    {category}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Media */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#000000'
                }}
              >
                Media
              </h3>
              {selectedFilters.mediaTypes.length > 0 && (
                <button
                  onClick={() => onFilterChange('mediaTypes', 'clear')}
                  style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '14px',
                    color: '#6B7280',
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none'
                  }}
                >
                  Clear
                </button>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filters.mediaTypes.map((type) => (
                <label key={type} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFilters.mediaTypes.includes(type)}
                    onChange={() => onFilterChange('mediaTypes', type)}
                    className="w-4 h-4"
                  />
                  <span
                    style={{
                      fontFamily: 'Avenir Next, sans-serif',
                      fontSize: '14px',
                      color: '#000000'
                    }}
                  >
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Topic */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#000000'
                }}
              >
                Topic
              </h3>
              {selectedFilters.topics.length > 0 && (
                <button
                  onClick={() => onFilterChange('topics', 'clear')}
                  style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '14px',
                    color: '#6B7280',
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none'
                  }}
                >
                  Clear
                </button>
              )}
            </div>
            
            {/* Topic Search */}
            <div className="relative mb-3">
              <Search 
                size={18} 
                color="#9CA3AF" 
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
              />
              <input
                type="text"
                placeholder="Search"
                value={topicSearch}
                onChange={(e) => setTopicSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFilters.topics.length === filters.topics.length}
                  onChange={() => onFilterChange('topics', 'all')}
                  className="w-4 h-4"
                />
                <span
                  style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#000000'
                  }}
                >
                  Select All
                </span>
              </label>
              
              {filteredTopics.map((topic) => (
                <label key={topic.name} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFilters.topics.includes(topic.name)}
                    onChange={() => onFilterChange('topics', topic.name)}
                    className="w-4 h-4"
                  />
                  <span
                    style={{
                      fontFamily: 'Avenir Next, sans-serif',
                      fontSize: '14px',
                      color: '#000000'
                    }}
                  >
                    {topic.name}
                  </span>
                  <span
                    className="ml-auto"
                    style={{
                      fontFamily: 'Avenir Next, sans-serif',
                      fontSize: '12px',
                      color: '#6B7280'
                    }}
                  >
                    {topic.count}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Level */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3
                style={{
                  fontFamily: 'Avenir Next, sans-serif',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#000000'
                }}
              >
                Level
              </h3>
              {selectedFilters.levels.length > 0 && (
                <button
                  onClick={() => onFilterChange('levels', 'clear')}
                  style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '14px',
                    color: '#6B7280',
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none'
                  }}
                >
                  Clear
                </button>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFilters.levels.length === filters.levels.length}
                  onChange={() => onFilterChange('levels', 'all')}
                  className="w-4 h-4"
                />
                <span
                  style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#000000'
                  }}
                >
                  Select All
                </span>
              </label>
              
              {filters.levels.map((level) => (
                <label key={level.name} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFilters.levels.includes(level.name)}
                    onChange={() => onFilterChange('levels', level.name)}
                    className="w-4 h-4"
                  />
                  <span
                    style={{
                      fontFamily: 'Avenir Next, sans-serif',
                      fontSize: '14px',
                      color: '#000000'
                    }}
                  >
                    {level.name}
                  </span>
                  <span
                    className="ml-auto"
                    style={{
                      fontFamily: 'Avenir Next, sans-serif',
                      fontSize: '12px',
                      color: '#6B7280'
                    }}
                  >
                    {level.count}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex items-center gap-4">
          <button
            onClick={onClear}
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid #D5D7DA',
              borderRadius: '8px',
              background: 'transparent',
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              color: '#000000',
              cursor: 'pointer'
            }}
          >
            Clear all
          </button>
          <button
            onClick={() => {
              onApply();
              onClose();
            }}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              background: '#7D1A13',
              border: 'none',
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              color: '#FFFFFF',
              cursor: 'pointer'
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// LOGIN OVERLAY COMPONENT
// ============================================================================

const LoginOverlay = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      <div 
        className="relative bg-white rounded-2xl p-8 max-w-md w-full text-center"
        style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)' }}
      >
        <h3
          className="mb-4"
          style={{
            fontFamily: 'Optima, Georgia, serif',
            fontSize: '24px',
            fontWeight: 600,
            color: '#000000'
          }}
        >
          To Save This Product, Please Create a Free Account
        </h3>
        
        <p
          className="mb-6"
          style={{
            fontFamily: 'Avenir Next, sans-serif',
            fontSize: '16px',
            lineHeight: '24px',
            color: '#384250'
          }}
        >
          By signing up, you'll unlock your personal dashboard, gain access to our free library of teachings, receive a full meditation course, and enjoy a preview of exclusive members-only content.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => window.location.href = '/signup'}
            style={{
              width: '100%',
              padding: '12px 24px',
              background: '#7D1A13',
              borderRadius: '8px',
              border: 'none',
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '16px',
              fontWeight: 600,
              color: '#FFFFFF',
              cursor: 'pointer'
            }}
          >
            Create Account
          </button>
          
          <button
            onClick={() => window.location.href = '/login'}
            style={{
              width: '100%',
              padding: '12px 24px',
              background: 'transparent',
              border: '2px solid #7D1A13',
              borderRadius: '8px',
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '16px',
              fontWeight: 600,
              color: '#7D1A13',
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN STORE PAGE COMPONENT
// ============================================================================

const DharmaStorePage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  const itemsPerPage = 12;
  const isLoggedIn = false; // This would come from your auth system

  // Mock filters state
  const [selectedFilters, setSelectedFilters] = useState({
    categories: [] as string[],
    mediaTypes: [] as string[],
    topics: [] as string[],
    levels: [] as string[]
  });

  // Standard section data
  const standardSectionData: StandardSectionData = {
    tagline: 'STORE',
    title: 'The Dharma Bandhara',
    description: 'The Sat Yoga Online Store is a treasure trove of life-altering knowledge, in the form of unrepeatable retreats, paradigm-shifting books, beautiful guided meditations, as well as the popular Reading the Sages audio collections.'
  };

  // Mock products data
  const allProducts: Product[] = [
    {
      id: '1',
      slug: 'tibetan-zen',
      title: 'Break Through to the Blissful Light!',
      price: 95.00,
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
      category: 'Shunyamurti reads',
      tags: [{ label: 'Audio', color: '#6B7280' }],
      featured: true,
      description: 'The startling new depth of understanding that you will receive from the teachings of this retreat will demolish the defenses around your heart and open you to the full intensity of the Supreme Presence.',
      topics: ['Zen', 'Buddhism'],
      level: 'Advanced',
      mediaType: 'Audio'
    },
    {
      id: '2',
      slug: 'eagle-warrior',
      title: 'The Eagle Warrior Path',
      price: 20.00,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      category: 'Book group',
      tags: [{ label: 'Video', color: '#7D1A13' }, { label: 'Audio', color: '#6B7280' }],
      topics: ['Yoga Philosophy', 'Tantra'],
      level: 'Intermediate',
      mediaType: 'Video'
    },
    {
      id: '3',
      slug: 'meditation-fundamentals',
      title: 'Fundamentals of Meditation',
      price: 20.00,
      image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400',
      category: 'Course',
      tags: [{ label: 'Audio', color: '#6B7280' }],
      topics: ['Healing', 'Ramana Maharshi'],
      level: 'Beginner',
      mediaType: 'Audio'
    },
    {
      id: '4',
      slug: 'guided-journey',
      title: 'Guided Meditation Journey',
      price: 20.00,
      image: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=400',
      category: 'Guided meditation',
      tags: [{ label: 'Audio', color: '#6B7280' }],
      topics: ['Dzogchen', 'Healing'],
      level: 'Beginner',
      mediaType: 'Audio'
    },
    {
      id: '5',
      slug: 'past-retreat-2023',
      title: 'Winter Solstice Retreat 2023',
      price: 20.00,
      image: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400',
      category: 'Past online retreats',
      tags: [{ label: 'Video', color: '#7D1A13' }],
      topics: ['Advaita Vedanta', 'Alchemy'],
      level: 'Advanced',
      mediaType: 'Video'
    },
    {
      id: '6',
      slug: 'ebook-consciousness',
      title: 'The Map of Consciousness',
      price: 20.00,
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
      category: 'EBooks',
      tags: [{ label: 'Text', color: '#9C7E27' }],
      topics: ['Buddhism', 'Dao (Taoism)'],
      level: 'Intermediate',
      mediaType: 'E-books'
    }
  ];

  // Filter options derived from products
  const filterOptions: FilterOptions = {
    categories: ['EBooks', 'Past Online Retreats', 'Courses', 'Book group', 'Guided Meditations', 'Shunyamurti Reads'],
    mediaTypes: ['E-books', 'Audio', 'Video'],
    topics: [
      { name: 'Advaita Vedanta', count: 18 },
      { name: 'Alchemy', count: 17 },
      { name: 'Buddhism', count: 20 },
      { name: 'Dao (Taoism)', count: 3 },
      { name: 'Dzogchen', count: 56 },
      { name: 'Healing', count: 40 },
      { name: 'Ramana Maharshi', count: 40 },
      { name: 'Tantra', count: 26 },
      { name: 'Yoga Philosophy', count: 16 },
      { name: 'Zen', count: 106 }
    ],
    levels: [
      { name: 'Beginner', count: 360 },
      { name: 'Intermediate', count: 416 },
      { name: 'Advanced', count: 60 }
    ]
  };

  // Handle filter changes
  const handleFilterChange = (type: string, value: string) => {
    setSelectedFilters(prev => {
      if (value === 'clear') {
        return { ...prev, [type]: [] };
      }
      
      if (value === 'all') {
        const allValues = type === 'topics' 
          ? filterOptions.topics.map(t => t.name)
          : type === 'levels'
          ? filterOptions.levels.map(l => l.name)
          : [];
        
        return {
          ...prev,
          [type]: prev[type as keyof typeof prev].length === allValues.length ? [] : allValues
        };
      }

      const currentValues = prev[type as keyof typeof prev];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v: string) => v !== value)
        : [...currentValues, value];
      
      return { ...prev, [type]: newValues };
    });
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = allProducts;

    // Filter by active category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(p => 
        p.category.toLowerCase().replace(/\s+/g, '-') === activeCategory
      );
    }

    // Apply advanced filters
    if (selectedFilters.categories.length > 0) {
      filtered = filtered.filter(p => 
        selectedFilters.categories.includes(p.category)
      );
    }

    if (selectedFilters.mediaTypes.length > 0) {
      filtered = filtered.filter(p => 
        p.mediaType && selectedFilters.mediaTypes.includes(p.mediaType)
      );
    }

    if (selectedFilters.topics.length > 0) {
      filtered = filtered.filter(p => 
        p.topics && p.topics.some(t => selectedFilters.topics.includes(t))
      );
    }

    if (selectedFilters.levels.length > 0) {
      filtered = filtered.filter(p => 
        p.level && selectedFilters.levels.includes(p.level)
      );
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [activeCategory, selectedFilters, searchQuery, allProducts]);

  // Featured product
  const featuredProduct = allProducts.find(p => p.featured);
  const nonFeaturedProducts = filteredProducts.filter(p => !p.featured);

  // Pagination
  const totalPages = Math.ceil(nonFeaturedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = nonFeaturedProducts.slice(startIndex, startIndex + itemsPerPage);

  const handleSaveProduct = () => {
    if (!isLoggedIn) {
      setShowLoginOverlay(true);
    } else {
      // Handle save logic
      console.log('Product saved!');
    }
  };

  const categories = [
    { id: 'all', label: 'All products' },
    { id: 'past-online-retreats', label: 'Past online retreats' },
    { id: 'book-group', label: 'Book group' },
    { id: 'ebooks', label: 'Ebooks' },
    { id: 'shunyamurti-reads', label: 'Shunyamurti reads' },
    { id: 'guided-meditations', label: 'Guided meditations' },
    { id: 'courses', label: 'Courses' }
  ];

  return (
    <div className="w-full" style={{ backgroundColor: '#FAF8F1' }}>
      {/* Standard Section */}
      <StandardSection data={standardSectionData} />

      {/* Store Content */}
      <section className="w-full flex flex-col items-center px-4 lg:px-16 pb-16">
        <div className="w-full max-w-7xl" style={{ gap: '48px', display: 'flex', flexDirection: 'column' }}>
          
          {/* Featured Product */}
          {featuredProduct && activeCategory === 'all' && (
            <FeaturedProduct 
              product={featuredProduct} 
              onSave={handleSaveProduct}
              isLoggedIn={isLoggedIn}
            />
          )}

          {/* Category Tabs */}
          <div className="flex flex-col items-center" style={{ gap: '32px' }}>
            <div className="overflow-x-auto w-full">
              <div
                className="flex items-center justify-center"
                style={{
                  gap: '0',
                  borderBottom: '1px solid #E9EAEB',
                  minWidth: 'fit-content'
                }}
              >
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setCurrentPage(1);
                    }}
                    style={{
                      padding: '12px 24px',
                      background: activeCategory === cat.id ? '#7D1A13' : '#FFFFFF',
                      border: '1px solid #D5D7DA',
                      borderBottom: activeCategory === cat.id ? 'none' : '1px solid #D5D7DA',
                      marginBottom: activeCategory === cat.id ? '-1px' : '0',
                      fontFamily: 'Inter',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: activeCategory === cat.id ? '#FFFFFF' : '#414651',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s',
                      position: 'relative',
                      zIndex: activeCategory === cat.id ? 1 : 0
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filters and Count */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between" style={{ gap: '16px' }}>
            <span
              style={{
                fontFamily: 'Avenir Next',
                fontWeight: 600,
                fontSize: '18px',
                color: '#111927'
              }}
            >
              {filteredProducts.length} items
            </span>

            <div className="flex items-center gap-3">
              <button
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'transparent',
                  fontFamily: 'Avenir Next',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#535862',
                  cursor: 'pointer'
                }}
              >
                Sort by
              </button>

              <button
                onClick={() => setIsFilterModalOpen(true)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #D5D7DA',
                  background: '#FFFFFF',
                  boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
                  fontFamily: 'Avenir Next',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#414651',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                Filters
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {paginatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSave={handleSaveProduct}
                isLoggedIn={isLoggedIn}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #D5D7DA',
                  background: currentPage === 1 ? '#F3F4F6' : '#FFFFFF',
                  fontFamily: 'Avenir Next',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: currentPage === 1 ? '#9CA3AF' : '#000000',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Previous
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(10, totalPages) }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      border: currentPage === page ? '2px solid #7D1A13' : '1px solid #D5D7DA',
                      background: currentPage === page ? '#FEF3F2' : '#FFFFFF',
                      fontFamily: 'Avenir Next',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: currentPage === page ? '#7D1A13' : '#000000',
                      cursor: 'pointer'
                    }}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #D5D7DA',
                  background: currentPage === totalPages ? '#F3F4F6' : '#FFFFFF',
                  fontFamily: 'Avenir Next',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: currentPage === totalPages ? '#9CA3AF' : '#000000',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filterOptions}
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
        onApply={() => setCurrentPage(1)}
        onClear={() => {
          setSelectedFilters({
            categories: [],
            mediaTypes: [],
            topics: [],
            levels: []
          });
        }}
      />

      {/* Login Overlay */}
      {showLoginOverlay && (
        <LoginOverlay onClose={() => setShowLoginOverlay(false)} />
      )}
    </div>
  );
};

export default DharmaStorePage;