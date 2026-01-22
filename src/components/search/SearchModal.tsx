'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { X, Search, Loader2 } from 'lucide-react';
import { searchSite, getCategoryDisplayName, type SearchResponse, type SearchResult } from '@/lib/search-api';
import { searchDashboard, getUserRelationshipBadge, getUserRelationshipBadgeColor, type DashboardSearchResult, type DashboardSearchResponse } from '@/lib/dashboard-search-api';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  dashboardMode?: boolean;
}

export default function SearchModal({ isOpen, onClose, dashboardMode = false }: SearchModalProps) {
  const { data: session } = useSession();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResponse | DashboardSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Flatten results for keyboard navigation
  const flatResults = results
    ? [
        ...results.results.teachings,
        ...results.results.courses,
        ...results.results.products,
        ...results.results.retreats,
        ...results.results.pages,
      ]
    : [];

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeoutId = setTimeout(async () => {
      let searchResults;
      if (dashboardMode && session?.user?.accessToken) {
        searchResults = await searchDashboard(query.trim(), session.user.accessToken, 5);
      } else {
        searchResults = await searchSite(query.trim(), 5);
      }
      setResults(searchResults);
      setLoading(false);
      setSelectedIndex(0);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, dashboardMode, session]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, flatResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && flatResults.length > 0) {
        e.preventDefault();
        const selected = flatResults[selectedIndex];
        if (selected) {
          router.push(selected.url);
          onClose();
          setQuery('');
        }
      }
    },
    [flatResults, selectedIndex, onClose, router]
  );

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    router.push(result.url);
    onClose();
    setQuery('');
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
      setQuery('');
    }
  };

  if (!isOpen) return null;

  // Group results by category for display
  const categories = [
    { key: 'teachings', results: results?.results.teachings || [] },
    { key: 'courses', results: results?.results.courses || [] },
    { key: 'products', results: results?.results.products || [] },
    { key: 'retreats', results: results?.results.retreats || [] },
    { key: 'blogs', results: results?.results.blogs || [] },
    { key: 'pages', results: results?.results.pages || [] },
  ] as const;

  let currentFlatIndex = 0;

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center pt-20 px-4" onClick={handleBackdropClick}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Search Input */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search teachings, courses, products, retreats..."
              className="flex-1 outline-none text-base text-gray-900 placeholder-gray-400"
            />
            {loading && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
            <button
              onClick={() => {
                onClose();
                setQuery('');
              }}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="overflow-y-auto flex-1">
          {!query.trim() ? (
            // Empty state
            <div className="p-8 text-center text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Start typing to search across all content...</p>
              <p className="text-xs mt-2 text-gray-400">Press ESC to close</p>
            </div>
          ) : loading && !results ? (
            // Loading state
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 mx-auto mb-3 text-[#942017] animate-spin" />
              <p className="text-sm text-gray-500">Searching...</p>
            </div>
          ) : results && results.total_results === 0 ? (
            // No results
            <div className="p-8 text-center text-gray-500">
              <p className="text-sm">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs mt-2 text-gray-400">Try a different search term</p>
            </div>
          ) : (
            // Results grouped by category
            <div className="p-2">
              {categories.map((category) => {
                if (category.results.length === 0) return null;

                const categoryStartIndex = currentFlatIndex;
                currentFlatIndex += category.results.length;

                return (
                  <div key={category.key} className="mb-4">
                    <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {getCategoryDisplayName(category.key)} ({category.results.length})
                    </h3>
                    <div className="space-y-1">
                      {category.results.map((result, idx) => {
                        const flatIdx = categoryStartIndex + idx;
                        const isSelected = flatIdx === selectedIndex;

                        return (
                          <button
                            key={result.id}
                            onClick={() => handleResultClick(result)}
                            className={`w-full text-left px-3 py-2.5 rounded-md transition-colors ${
                              isSelected ? 'bg-[#942017]/10' : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex gap-3">
                              {result.thumbnail_url && (
                                <img
                                  src={result.thumbnail_url}
                                  alt={result.title}
                                  className="w-12 h-12 rounded object-cover flex-shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-medium text-gray-900 truncate">
                                    {result.title}
                                  </h4>
                                  {dashboardMode && 'user_relationship' in result && result.user_relationship && (
                                    <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${getUserRelationshipBadgeColor(result.user_relationship)}`}>
                                      {getUserRelationshipBadge(result.user_relationship)}
                                    </span>
                                  )}
                                </div>
                                {result.description && (
                                  <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                                    {result.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-gray-400 capitalize">{result.type}</span>
                                  {result.price && (
                                    <>
                                      <span className="text-gray-300">•</span>
                                      <span className="text-xs text-[#942017] font-medium">
                                        ${result.price}
                                      </span>
                                    </>
                                  )}
                                  {result.category && (
                                    <>
                                      <span className="text-gray-300">•</span>
                                      <span className="text-xs text-gray-400">{result.category}</span>
                                    </>
                                  )}
                                  {result.author && (
                                    <>
                                      <span className="text-gray-300">•</span>
                                      <span className="text-xs text-gray-400">{result.author}</span>
                                    </>
                                  )}
                                  {result.read_time && (
                                    <>
                                      <span className="text-gray-300">•</span>
                                      <span className="text-xs text-gray-400">{result.read_time} min read</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {results && results.total_results > 0 && (
          <div className="border-t border-gray-200 px-4 py-2 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span>{results.total_results} results found</span>
                {dashboardMode && 'user_content_count' in results && results.user_content_count > 0 && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="text-[#7D1A13] font-medium">{results.user_content_count} yours</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">↵</kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded text-xs">ESC</kbd>
                  Close
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
