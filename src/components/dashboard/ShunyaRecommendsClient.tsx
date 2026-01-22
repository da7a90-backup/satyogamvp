'use client';

import { useState, useMemo } from 'react';
import { Recommendation } from '@/lib/recommendations-api';
import { Lock, Search, BookOpen, Film } from 'lucide-react';

interface ShunyaRecommendsClientProps {
  initialRecommendations: Recommendation[];
  hasAccess: boolean;
  errorMessage: string;
  userMembershipTier: string;
}

type TabType = 'all' | 'books' | 'documentaries';

export default function ShunyaRecommendsClient({
  initialRecommendations,
  hasAccess,
  errorMessage,
  userMembershipTier,
}: ShunyaRecommendsClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter recommendations based on active tab, search, and category
  const filteredRecommendations = useMemo(() => {
    let filtered = initialRecommendations;

    // Filter by tab
    if (activeTab === 'books') {
      filtered = filtered.filter((r) => r.recommendationType === 'book');
    } else if (activeTab === 'documentaries') {
      filtered = filtered.filter((r) => r.recommendationType === 'documentary');
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.description?.toLowerCase().includes(query) ||
          r.author?.toLowerCase().includes(query) ||
          r.category?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((r) => r.category === selectedCategory);
    }

    // Sort by display order
    return filtered.sort((a, b) => a.displayOrder - b.displayOrder);
  }, [initialRecommendations, activeTab, searchQuery, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(
      initialRecommendations
        .map((r) => r.category)
        .filter((c): c is string => !!c)
    );
    return ['all', ...Array.from(cats)];
  }, [initialRecommendations]);

  const books = filteredRecommendations.filter((r) => r.recommendationType === 'book');
  const documentaries = filteredRecommendations.filter(
    (r) => r.recommendationType === 'documentary'
  );

  // Show upgrade message if user doesn't have access
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-[#FAF8F1] p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 md:p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-[#8B7355] rounded-full flex items-center justify-center">
                <Lock className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1
              className="text-3xl md:text-4xl font-bold text-[#000000] mb-4"
              style={{ fontFamily: 'Optima, serif' }}
            >
              Shunyamurti Recommends
            </h1>
            <p
              className="text-lg text-[#717680] mb-8 max-w-2xl mx-auto"
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              {errorMessage}
            </p>
            <a
              href="/membership"
              className="inline-block bg-[#8B7355] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#6F5B44] transition-colors"
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              Upgrade to Gyani
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F1] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-3xl md:text-4xl font-bold text-[#000000] mb-2"
            style={{ fontFamily: 'Optima, serif' }}
          >
            Shunyamurti Recommends
          </h1>
          <p
            className="text-lg text-[#717680]"
            style={{ fontFamily: 'Avenir Next, sans-serif' }}
          >
            Curated books and documentaries for your spiritual journey
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#717680]" />
              <input
                type="text"
                placeholder="Search recommendations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355] focus:border-transparent"
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
              />
            </div>

            {/* Category Filter */}
            <div className="md:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355] focus:border-transparent bg-white"
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-[#E5E5E5]">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'all'
                ? 'border-[#8B7355] text-[#8B7355]'
                : 'border-transparent text-[#717680] hover:text-[#8B7355]'
            }`}
            style={{ fontFamily: 'Avenir Next, sans-serif' }}
          >
            All ({filteredRecommendations.length})
          </button>
          <button
            onClick={() => setActiveTab('books')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'books'
                ? 'border-[#8B7355] text-[#8B7355]'
                : 'border-transparent text-[#717680] hover:text-[#8B7355]'
            }`}
            style={{ fontFamily: 'Avenir Next, sans-serif' }}
          >
            <BookOpen className="w-4 h-4" />
            Books ({books.length})
          </button>
          <button
            onClick={() => setActiveTab('documentaries')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'documentaries'
                ? 'border-[#8B7355] text-[#8B7355]'
                : 'border-transparent text-[#717680] hover:text-[#8B7355]'
            }`}
            style={{ fontFamily: 'Avenir Next, sans-serif' }}
          >
            <Film className="w-4 h-4" />
            Documentaries ({documentaries.length})
          </button>
        </div>

        {/* Content */}
        {filteredRecommendations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p
              className="text-lg text-[#717680]"
              style={{ fontFamily: 'Avenir Next, sans-serif' }}
            >
              No recommendations found. Try adjusting your filters.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Books Section */}
            {(activeTab === 'all' || activeTab === 'books') && books.length > 0 && (
              <div>
                {activeTab === 'all' && (
                  <h2
                    className="text-2xl font-bold text-[#000000] mb-4"
                    style={{ fontFamily: 'Optima, serif' }}
                  >
                    Books
                  </h2>
                )}
                <BooksTable books={books} />
              </div>
            )}

            {/* Documentaries Section */}
            {(activeTab === 'all' || activeTab === 'documentaries') &&
              documentaries.length > 0 && (
                <div>
                  {activeTab === 'all' && (
                    <h2
                      className="text-2xl font-bold text-[#000000] mb-4"
                      style={{ fontFamily: 'Optima, serif' }}
                    >
                      Documentaries
                    </h2>
                  )}
                  <DocumentaryGrid documentaries={documentaries} />
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}

// Books Table Component (will be implemented)
function BooksTable({ books }: { books: Recommendation[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#F5F5F5] border-b border-[#E5E5E5]">
            <tr>
              <th
                className="px-6 py-4 text-left text-sm font-semibold text-[#000000]"
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
              >
                Title
              </th>
              <th
                className="px-6 py-4 text-left text-sm font-semibold text-[#000000]"
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
              >
                Author
              </th>
              <th
                className="px-6 py-4 text-left text-sm font-semibold text-[#000000]"
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
              >
                Category
              </th>
              <th
                className="px-6 py-4 text-right text-sm font-semibold text-[#000000]"
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E5]">
            {books.map((book) => (
              <tr key={book.id} className="hover:bg-[#FAF8F1] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {book.coverImageUrl && (
                      <img
                        src={book.coverImageUrl}
                        alt={book.title}
                        className="w-12 h-16 object-cover rounded shadow-sm"
                      />
                    )}
                    <div>
                      <div
                        className="font-semibold text-[#000000]"
                        style={{ fontFamily: 'Avenir Next, sans-serif' }}
                      >
                        {book.title}
                      </div>
                      {book.description && (
                        <div
                          className="text-sm text-[#717680] mt-1 line-clamp-2"
                          style={{ fontFamily: 'Avenir Next, sans-serif' }}
                        >
                          {book.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div
                    className="text-[#717680]"
                    style={{ fontFamily: 'Avenir Next, sans-serif' }}
                  >
                    {book.author || '—'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {book.category && (
                    <span
                      className="inline-block px-3 py-1 bg-[#8B7355] bg-opacity-10 text-[#8B7355] text-sm rounded-full"
                      style={{ fontFamily: 'Avenir Next, sans-serif' }}
                    >
                      {book.category}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {book.amazonUrl && (
                    <a
                      href={book.amazonUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-[#8B7355] text-white text-sm rounded-lg hover:bg-[#6F5B44] transition-colors"
                      style={{ fontFamily: 'Avenir Next, sans-serif' }}
                    >
                      View on Amazon
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Documentary Grid Component (will be implemented)
function DocumentaryGrid({ documentaries }: { documentaries: Recommendation[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {documentaries.map((doc) => (
        <div
          key={doc.id}
          className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
        >
          {/* YouTube Embed */}
          {doc.youtubeId && (
            <div className="aspect-video bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${doc.youtubeId}`}
                title={doc.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-4">
            <h3
              className="font-bold text-lg text-[#000000] mb-2"
              style={{ fontFamily: 'Optima, serif' }}
            >
              {doc.title}
            </h3>
            {doc.description && (
              <p
                className="text-sm text-[#717680] mb-3 line-clamp-3"
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
              >
                {doc.description}
              </p>
            )}
            {doc.category && (
              <span
                className="inline-block px-3 py-1 bg-[#8B7355] bg-opacity-10 text-[#8B7355] text-sm rounded-full"
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
              >
                {doc.category}
              </span>
            )}
            {doc.duration && (
              <span
                className="ml-2 text-sm text-[#717680]"
                style={{ fontFamily: 'Avenir Next, sans-serif' }}
              >
                {Math.floor(doc.duration / 60)} min
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
