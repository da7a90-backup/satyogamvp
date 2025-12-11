'use client'

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

// TypeScript interfaces for data structure
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  label: string;
  faqs: FAQItem[];
}

interface FAQSectionData {
  searchPlaceholder: string;
  categories: FAQCategory[];
}

interface FAQSectionProps {
  data: FAQSectionData;
}

export default function FAQSection({ data }: FAQSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>('general');
  const [openItemIndex, setOpenItemIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const toggleItem = (index: number) => {
    setOpenItemIndex(openItemIndex === index ? null : index);
  };

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setOpenItemIndex(0); // Open first item when switching categories
  };

  // Get FAQs based on active category
  let faqs: FAQItem[] = [];

  if (activeCategory === 'all') {
    // Combine all FAQs from all categories (except 'all' itself)
    faqs = data.categories
      .filter(cat => cat.id !== 'all')
      .flatMap(cat => cat.faqs);
  } else {
    const activeData = data.categories.find(cat => cat.id === activeCategory);
    faqs = activeData?.faqs || [];
  }

  // Filter FAQs based on search query
  const filteredFaqs = faqs.filter(faq => {
    if (!searchQuery.trim()) return true;

    const searchLower = searchQuery.toLowerCase();
    const questionMatch = faq.question.toLowerCase().includes(searchLower);
    const answerMatch = faq.answer.toLowerCase().includes(searchLower);

    return questionMatch || answerMatch;
  });

  // Reset open item when search query changes
  useEffect(() => {
    setOpenItemIndex(filteredFaqs.length > 0 ? 0 : null);
  }, [searchQuery, activeCategory]);

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .faq-section-container {
          background: #FAF8F1;
          padding: 112px 64px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 40px;
        }

        .faq-search-wrapper {
          width: 100%;
          max-width: 732px;
        }

        .faq-search-bar {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          gap: 12px;
          background: #FFFFFF;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          height: 36px;
        }

        .faq-tabs-container {
          border-bottom: 1px solid #E9EAEB;
          width: 100%;
          max-width: 732px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .faq-tabs-container::-webkit-scrollbar {
          height: 4px;
        }

        .faq-tabs-container::-webkit-scrollbar-track {
          background: transparent;
        }

        .faq-tabs-container::-webkit-scrollbar-thumb {
          background: #D4D4D4;
          border-radius: 2px;
        }

        .faq-tabs-wrapper {
          display: flex;
          gap: 12px;
          min-width: max-content;
        }

        .faq-accordion-wrapper {
          width: 100%;
          max-width: 732px;
        }

        @media (max-width: 768px) {
          .faq-section-container {
            padding: 16px;
            gap: 24px;
          }

          .faq-search-wrapper,
          .faq-tabs-container,
          .faq-accordion-wrapper {
            width: 100%;
            max-width: 100%;
          }
        }
      `}</style>
      <div className="faq-section-container">

      {/* Search Bar */}
      <div className="faq-search-wrapper">
        <div className="faq-search-bar">
          <Search size={20} color="#1F2937" strokeWidth={1.5} />
          <input
            type="text"
            placeholder={data.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              flex: 1,
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '20px',
              color: '#111827',
              background: 'transparent'
            }}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="faq-tabs-container">
        <div className="faq-tabs-wrapper">
          {data.categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              style={{
                padding: '0px 4px 12px',
                border: 'none',
                background: 'transparent',
                borderBottom: activeCategory === category.id ? '2px solid #942017' : 'none',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
                fontWeight: 600,
                lineHeight: '24px',
                color: activeCategory === category.id ? '#942017' : '#717680',
                whiteSpace: 'nowrap'
              }}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="faq-accordion-wrapper">
        {filteredFaqs.length === 0 ? (
          <div
            style={{
              padding: '40px',
              textAlign: 'center',
              fontFamily: 'Avenir Next, sans-serif',
              fontSize: '16px',
              color: '#717680'
            }}
          >
            No FAQs found matching your search.
          </div>
        ) : (
          <div
            style={{
              borderBottom: '1px solid #D4D4D4'
            }}
          >
            {filteredFaqs.map((faq, index) => (
            <div key={index} style={{ borderTop: '1px solid #D4D4D4' }}>
              {/* Question Header */}
              <button
                onClick={() => toggleItem(index)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '20px 0px',
                  gap: '24px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <h3
                  style={{
                    fontFamily: 'Avenir Next, sans-serif',
                    fontSize: '18px',
                    fontWeight: 600,
                    lineHeight: '28px',
                    color: '#000000',
                    margin: 0,
                    flex: 1
                  }}
                >
                  {faq.question}
                </h3>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transform: openItemIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }}
                >
                  <svg width="17" height="10" viewBox="0 0 17 10" fill="none">
                    <path
                      d="M1 1L8.5 8.5L16 1"
                      stroke="#000000"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </button>

              {/* Answer */}
              {openItemIndex === index && (
                <div
                  key={index}
                  style={{
                    paddingBottom: '24px',
                    animation: 'fadeInUp 0.3s ease-out'
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'Avenir Next, sans-serif',
                      fontSize: '16px',
                      fontWeight: 500,
                      lineHeight: '24px',
                      color: '#384250',
                      margin: 0,
                      whiteSpace: 'pre-line'
                    }}
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        )}
      </div>
      </div>
    </>
  );
}