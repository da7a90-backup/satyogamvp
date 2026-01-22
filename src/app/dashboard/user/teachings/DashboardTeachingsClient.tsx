"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Heart, Clock, Search, ChevronLeft, ChevronRight, Filter, X, Play } from "lucide-react";
import Image from "next/image";

interface Teaching {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail_url: string;
  duration: number;
  published_date: string;
  category: string;
  content_type: string;
  access_level: string;
  featured?: string | null;
  of_the_month?: string | null;
  pinned?: string | null;
  view_count: number;
  can_access: boolean;
}

interface DashboardTeachingsClientProps {
  initialTeachings: Teaching[];
  initialFeaturedTeaching: Teaching | null;
}

export default function DashboardTeachingsClient({
  initialTeachings,
  initialFeaturedTeaching,
}: DashboardTeachingsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  // Check user membership tier
  const userTier = session?.user?.membershipTier?.toLowerCase() || 'free';
  const isFreeUser = userTier === 'free';

  // Get initial tab from URL query parameter
  const tabParam = searchParams.get('tab');
  // Map URL tab names to internal tab names
  const tabMapping: { [key: string]: string } = {
    'teachings': 'teachings',
    'meditations': 'guided_meditations',
    'qas': 'qas',
    'essays': 'essays'
  };
  const initialTab = tabParam && tabMapping[tabParam] ? tabMapping[tabParam] : 'teachings';

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [activeSubTab, setActiveSubTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [teachings, setTeachings] = useState<Teaching[]>(initialTeachings);
  const [featuredTeaching, setFeaturedTeaching] = useState<Teaching | null>(initialFeaturedTeaching);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [contentTypeFilter, setContentTypeFilter] = useState<string>("all");
  const itemsPerPage = 6;

  // Update tab when URL changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const tabMapping: { [key: string]: string } = {
      'teachings': 'teachings',
      'meditations': 'guided_meditations',
      'qas': 'qas',
      'essays': 'essays'
    };
    if (tabParam && tabMapping[tabParam]) {
      setActiveTab(tabMapping[tabParam]);
    }
  }, [searchParams]);

  // Load favorites on mount
  useEffect(() => {
    const loadFavorites = async () => {
      if (!session?.user?.accessToken) return;

      try {
        const FASTAPI_URL = process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || "http://127.0.0.1:8000";
        const response = await fetch(`${FASTAPI_URL}/api/teachings/favorites/list`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.user.accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const favoriteIds = new Set(data.favorites?.map((f: any) => f.id) || []);
          setFavorites(favoriteIds);
        }
      } catch (error) {
        console.error("Error loading favorites:", error);
      }
    };

    loadFavorites();
  }, [session]);

  // Toggle favorite
  const toggleFavorite = async (teachingId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!session?.user?.accessToken) return;

    try {
      const FASTAPI_URL = process.env.NEXT_PUBLIC_API_URL?.replace('localhost', '127.0.0.1') || "http://127.0.0.1:8000";

      const response = await fetch(`${FASTAPI_URL}/api/teachings/${teachingId}/favorite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.user.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFavorites((prev) => {
          const newFavorites = new Set(prev);
          if (data.is_favorite) {
            newFavorites.add(teachingId);
          } else {
            newFavorites.delete(teachingId);
          }
          return newFavorites;
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  // Get featured teaching based on active tab
  const getFeaturedTeaching = () => {
    if (activeTab === "teachings") {
      return teachings.find((t) => t.featured === "teaching" && t.category === "video_teaching") ||
        teachings.find((t) => t.category === "video_teaching");
    } else if (activeTab === "guided_meditations") {
      return teachings.find((t) => t.of_the_month === "meditation" && t.category === "guided_meditation") ||
        teachings.find((t) => t.category === "guided_meditation");
    } else if (activeTab === "qas") {
      return teachings.find((t) => t.category === "qa");
    } else if (activeTab === "essays") {
      return teachings.find((t) => t.pinned === "essay" && t.category === "essay") ||
        teachings.find((t) => t.category === "essay");
    }
    return null;
  };

  const currentFeaturedTeaching = getFeaturedTeaching();

  // Filter teachings based on active tab, sub-tab, and filters
  const filteredTeachings = teachings.filter((teaching) => {
    // Filter by category based on active tab
    let categoryMatch = true;
    if (activeTab === "teachings") {
      categoryMatch = teaching.category === "video_teaching";
    } else if (activeTab === "guided_meditations") {
      categoryMatch = teaching.category === "guided_meditation";
    } else if (activeTab === "qas") {
      categoryMatch = teaching.category === "qa";
    } else if (activeTab === "essays") {
      categoryMatch = teaching.category === "essay";
    }

    // Filter by access level based on sub-tab
    const accessMatch = activeSubTab === "all" || teaching.access_level === "free";

    // Filter by content type
    let contentTypeMatch = true;
    if (contentTypeFilter !== "all") {
      const teachingType = teaching.content_type?.toLowerCase() || "";
      if (contentTypeFilter === "video") {
        contentTypeMatch = teachingType === "video" || teachingType === "videoandaudio" || teachingType === "video_teaching";
      } else if (contentTypeFilter === "audio") {
        contentTypeMatch = teachingType === "audio" || teachingType === "meditation" || teachingType === "guided_meditation";
      } else if (contentTypeFilter === "text") {
        contentTypeMatch = teachingType === "text" || teachingType === "essay";
      } else if (contentTypeFilter === "video_audio") {
        // Teachings that have both video and audio
        contentTypeMatch = teachingType === "video" || teachingType === "audio" || teachingType === "videoandaudio";
      }
    }

    // Filter by search query
    const searchMatch =
      !searchQuery ||
      teaching.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teaching.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return categoryMatch && accessMatch && contentTypeMatch && searchMatch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTeachings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTeachings = isFreeUser
    ? filteredTeachings.slice(0, 6)  // Show only 6 teachings for FREE users
    : filteredTeachings.slice(startIndex, startIndex + itemsPerPage);

  // Format duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minutes`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
    // Map internal tab names to URL tab names
    const reverseTabMapping: { [key: string]: string } = {
      'teachings': 'teachings',
      'guided_meditations': 'meditations',
      'qas': 'qas',
      'essays': 'essays'
    };
    // Update URL with the new tab
    const url = new URL(window.location.href);
    url.searchParams.set('tab', reverseTabMapping[tab] || tab);
    router.push(url.pathname + url.search, { scroll: false });
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col bg-[#FAF8F1] min-h-screen lg:min-h-[125vh]">
      {/* Header Section */}
      <div className="flex flex-col px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8 gap-4 lg:gap-6 border-b border-[#E5E7EB]">
        <div className="flex flex-col gap-5">
          {/* Page header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h1
              className="text-[24px] leading-[32px] font-[550] text-[#181D27]"
              style={{ fontFamily: "Optima, serif" }}
            >
              Library
            </h1>

            <div className="flex items-center gap-2 lg:gap-3">
              {/* Search Input */}
              <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#D5D7DA] rounded-lg shadow-sm flex-1 lg:w-[320px]">
                <Search className="w-5 h-5 text-[#717680] flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={handleSearch}
                  className="flex-1 text-base text-[#717680] outline-none bg-transparent min-w-0"
                  style={{ fontFamily: "Avenir Next, sans-serif" }}
                />
                <div className="hidden sm:block px-1 py-0.5 border border-[#E9EAEB] rounded text-xs text-[#717680] mix-blend-multiply">
                  ⌘K
                </div>
              </div>

              {/* Filter Button */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-3 lg:px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50 transition-colors ${
                    showFilters ? "border-[#7D1A13] bg-[#7D1A13]/5" : "border-[#D5D7DA]"
                  }`}
                >
                  <Filter className="w-5 h-5 text-[#717680]" />
                  <span className="hidden sm:inline text-sm font-medium text-[#181D27]">Filters</span>
                  {contentTypeFilter !== "all" && (
                    <span className="ml-1 px-2 py-0.5 bg-[#7D1A13] text-white text-xs rounded-full">1</span>
                  )}
                </button>

                {/* Filter Dropdown */}
                {showFilters && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-[#E5E7EB] rounded-lg shadow-lg z-50 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-[#181D27]">Filters</h3>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <X className="w-4 h-4 text-[#717680]" />
                      </button>
                    </div>

                    {/* Content Type Filter */}
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-[#717680] mb-2">Content Type</label>
                      <select
                        value={contentTypeFilter}
                        onChange={(e) => {
                          setContentTypeFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full px-3 py-2 bg-white border border-[#D5D7DA] rounded-lg text-sm text-[#181D27] focus:outline-none focus:ring-2 focus:ring-[#7D1A13] focus:border-transparent"
                      >
                        <option value="all">All Types</option>
                        <option value="video">Video Only</option>
                        <option value="audio">Audio Only</option>
                        <option value="text">Text Only</option>
                        <option value="video_audio">Video & Audio</option>
                      </select>
                    </div>

                    {/* Clear Filters Button */}
                    {contentTypeFilter !== "all" && (
                      <button
                        onClick={() => {
                          setContentTypeFilter("all");
                          setCurrentPage(1);
                        }}
                        className="w-full px-3 py-2 text-sm text-[#7D1A13] hover:bg-[#7D1A13]/5 rounded-lg transition-colors"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#E9EAEB]">
          <button
            onClick={() => handleTabChange("teachings")}
            className={`px-1 pb-3 text-sm font-semibold ${
              activeTab === "teachings"
                ? "border-b-2 border-[#942017] text-[#7D1A13]"
                : "text-[#717680]"
            }`}
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Teachings
          </button>
          <button
            onClick={() => handleTabChange("guided_meditations")}
            className={`ml-3 px-1 pb-3 text-sm font-semibold ${
              activeTab === "guided_meditations"
                ? "border-b-2 border-[#942017] text-[#7D1A13]"
                : "text-[#717680]"
            }`}
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Guided Meditations
          </button>
          <button
            onClick={() => handleTabChange("qas")}
            className={`ml-3 px-1 pb-3 text-sm font-semibold ${
              activeTab === "qas"
                ? "border-b-2 border-[#942017] text-[#7D1A13]"
                : "text-[#717680]"
            }`}
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Q&A's
          </button>
          <button
            onClick={() => handleTabChange("essays")}
            className={`ml-3 px-1 pb-3 text-sm font-semibold ${
              activeTab === "essays"
                ? "border-b-2 border-[#942017] text-[#7D1A13]"
                : "text-[#717680]"
            }`}
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Essays
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col p-4 sm:p-6 lg:p-8 gap-6">
        {/* Featured Teaching - Dashboard Homepage Style */}
        {currentFeaturedTeaching && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base lg:text-lg font-semibold text-[#181D27]">
                {activeTab === "teachings" && "Featured teaching"}
                {activeTab === "guided_meditations" && "Guided Meditation of the Month"}
                {activeTab === "essays" && "Featured Essay"}
                {activeTab === "qas" && "Latest Q&A"}
              </h2>
            </div>

            <div className="relative w-full min-h-[200px] lg:h-[240px] bg-white border border-[#D1D1D1] rounded-lg overflow-hidden cursor-pointer" onClick={() => router.push(`/dashboard/user/teachings/${currentFeaturedTeaching.slug}`)}>
              <div className="flex flex-col lg:flex-row h-full">
                {/* Thumbnail */}
                <div className="relative w-full lg:w-[426px] h-[200px] lg:h-full bg-gray-900 flex-shrink-0">
                  {currentFeaturedTeaching.thumbnail_url && (
                    <Image
                      src={currentFeaturedTeaching.thumbnail_url}
                      alt={currentFeaturedTeaching.title}
                      fill
                      className="object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/20" />

                  {/* Play button */}
                  <button className="absolute inset-0 m-auto w-16 h-16 flex items-center justify-center bg-white rounded-full hover:scale-105 transition">
                    <Play className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" />
                  </button>

                  {/* Duration badge */}
                  <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/40 backdrop-blur-sm rounded text-white text-xs font-medium">
                    Video
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col p-4 gap-4 flex-grow">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-[#7D1A13]">Video Teaching</span>
                      <div className="flex items-center gap-2 text-sm font-semibold text-[#384250]">
                        <Clock className="w-4 h-4 text-[#535862]" />
                        {Math.floor((currentFeaturedTeaching.duration || 2700) / 60)} minutes
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-[#181D27] line-clamp-2">
                      {currentFeaturedTeaching.title}
                    </h3>
                    <p className="text-base text-[#535862] line-clamp-3">
                      {currentFeaturedTeaching.description}
                    </p>
                  </div>
                </div>

                {/* Favorite button */}
                <button
                  onClick={(e) => toggleFavorite(currentFeaturedTeaching.id, e)}
                  className="absolute top-4 right-4 w-13 h-13 flex items-center justify-center bg-white/40 rounded-full hover:bg-white/60 transition"
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-white/40 rounded-full">
                    <Heart className={`w-5 h-5 ${favorites.has(currentFeaturedTeaching.id) ? "fill-red-500 text-red-500" : ""}`} />
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recent Teachings Section */}
        <div className="flex flex-col gap-4 border-t border-[#E5E7EB] pt-6">
          <div className="flex items-center justify-between">
            <h2
              className="text-[20px] leading-[28px] font-semibold text-[#181D27]"
              style={{ fontFamily: "Avenir Next, sans-serif" }}
            >
              {activeTab === "teachings" && "Recent teachings"}
              {activeTab === "guided_meditations" && "Recent meditations"}
              {activeTab === "essays" && "Recent essays"}
              {activeTab === "qas" && "Recent Q&A's"}
            </h2>
          </div>

          {/* Sub-tabs */}
          <div className="flex items-center justify-between border-b border-[#E9EAEB]">
            <div className="flex items-center">
              <button
                onClick={() => setActiveSubTab("all")}
                className={`px-1 pb-3 text-sm font-semibold ${
                  activeSubTab === "all"
                    ? "border-b-2 border-[#942017] text-[#7D1A13]"
                    : "text-[#717680]"
                }`}
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                All
              </button>
              <button
                onClick={() => setActiveSubTab("free")}
                className={`ml-3 px-1 pb-3 text-sm font-semibold ${
                  activeSubTab === "free"
                    ? "border-b-2 border-[#942017] text-[#7D1A13]"
                    : "text-[#717680]"
                }`}
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Free teachings
              </button>
            </div>
            <div className="flex gap-3 items-center">
              <span className="text-xs font-semibold text-[#111927]" style={{ fontFamily: "Avenir Next, sans-serif" }}>
                {filteredTeachings.length} items
              </span>
              <button
                className="flex items-center gap-2 px-3 py-2 bg-white border border-[#D5D7DA] text-sm font-semibold text-[#414651] rounded-lg shadow-sm hover:bg-gray-50"
                style={{ fontFamily: "Avenir Next, sans-serif" }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 5L8 10L3 15" stroke="currentColor" strokeWidth="1.67" />
                </svg>
                Filters
              </button>
            </div>
          </div>

          {/* Teaching Cards Grid - Dashboard Homepage Style */}
          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="relative">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
                {paginatedTeachings.map((teaching) => (
                <div
                  key={teaching.id}
                  className="flex flex-col cursor-pointer"
                  onClick={() => router.push(`/dashboard/user/teachings/${teaching.slug}`)}
                >
                  <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden mb-3">
                    {teaching.thumbnail_url && (
                      <Image
                        src={teaching.thumbnail_url}
                        alt={teaching.title}
                        fill
                        className="object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/15" />

                    <button className="absolute inset-0 m-auto w-16 h-16 flex items-center justify-center bg-white rounded-full hover:scale-105 transition">
                      <Play className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" />
                    </button>

                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/40 backdrop-blur-sm rounded text-white text-[10px] font-medium">
                      Video
                    </div>

                    <button
                      onClick={(e) => toggleFavorite(teaching.id, e)}
                      className="absolute top-4 right-4 w-13 h-13 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition"
                    >
                      <div className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-full">
                        <Heart className={`w-5 h-5 ${favorites.has(teaching.id) ? "fill-red-500 text-red-500" : "text-white"}`} />
                      </div>
                    </button>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-[#7D1A13]">Video Teaching</span>
                      <div className="flex items-center gap-2 text-sm font-semibold text-[#384250]">
                        <Clock className="w-4 h-4 text-[#535862]" />
                        {Math.floor((teaching.duration || 2700) / 60)} min
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-black line-clamp-2">
                      {teaching.title}
                    </h3>
                    <p className="text-base text-[#384250] line-clamp-3">
                      {teaching.description}
                    </p>
                  </div>
                </div>
              ))}
              </div>

              {/* FREE tier upgrade overlay */}
              {isFreeUser && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-[#FAF8F1] via-[#FAF8F1]/95 to-transparent pt-20">
                  <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-xl p-8 max-w-lg mx-4 text-center">
                    <h3 className="text-2xl font-semibold text-[#181D27] mb-4">
                      Upgrade to Gyani to access the full library
                    </h3>
                    <p className="text-[#535862] mb-6">
                      Unlock hundreds of teachings, guided meditations, and exclusive content with a Gyani membership.
                    </p>
                    <button
                      onClick={() => router.push('/dashboard/user/settings/billing')}
                      className="px-6 py-3 bg-[#7D1A13] text-white rounded-lg hover:bg-[#942017] transition-colors font-semibold"
                    >
                      Upgrade Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!isFreeUser && totalPages > 1 && (
          <div className="flex items-center justify-between pt-5 border-t border-[#E9EAEB] gap-2">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`flex items-center gap-1 px-2 sm:px-3 py-2 rounded-lg border shadow-sm flex-shrink-0 ${
                currentPage === 1
                  ? "bg-white border-[#E9EAEB] text-[#A4A7AE] cursor-not-allowed"
                  : "bg-white border-[#E9EAEB] text-[#A4A7AE] hover:bg-gray-50"
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-semibold" style={{ fontFamily: "Avenir Next, sans-serif" }}>
                Previous
              </span>
            </button>

            {/* Page Numbers */}
            <div className="flex gap-0.5 overflow-x-auto scrollbar-hide flex-1 justify-center max-w-full">
              {(() => {
                const pages = [];
                const delta = 2; // Show 2 pages before and after current page

                // If total pages <= 9, show all pages
                if (totalPages <= 9) {
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium ${
                          currentPage === i
                            ? "bg-[#FAFAFA] text-[#252B37]"
                            : "text-[#535862] hover:bg-gray-50"
                        }`}
                        style={{ fontFamily: "Avenir Next, sans-serif" }}
                      >
                        {i}
                      </button>
                    );
                  }
                } else {
                  // Always show first page
                  pages.push(
                    <button
                      key={1}
                      onClick={() => setCurrentPage(1)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium ${
                        currentPage === 1
                          ? "bg-[#FAFAFA] text-[#252B37]"
                          : "text-[#535862] hover:bg-gray-50"
                      }`}
                      style={{ fontFamily: "Avenir Next, sans-serif" }}
                    >
                      1
                    </button>
                  );

                  // Calculate range around current page
                  const rangeStart = Math.max(2, currentPage - delta);
                  const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

                  // Show left ellipsis if there's a gap
                  if (rangeStart > 2) {
                    pages.push(
                      <span key="ellipsis-left" className="w-10 h-10 flex items-center justify-center text-[#535862]">
                        ...
                      </span>
                    );
                  }

                  // Show pages around current page
                  for (let i = rangeStart; i <= rangeEnd; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium ${
                          currentPage === i
                            ? "bg-[#FAFAFA] text-[#252B37]"
                            : "text-[#535862] hover:bg-gray-50"
                        }`}
                        style={{ fontFamily: "Avenir Next, sans-serif" }}
                      >
                        {i}
                      </button>
                    );
                  }

                  // Show right ellipsis if there's a gap
                  if (rangeEnd < totalPages - 1) {
                    pages.push(
                      <span key="ellipsis-right" className="w-10 h-10 flex items-center justify-center text-[#535862]">
                        ...
                      </span>
                    );
                  }

                  // Always show last page
                  pages.push(
                    <button
                      key={totalPages}
                      onClick={() => setCurrentPage(totalPages)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium ${
                        currentPage === totalPages
                          ? "bg-[#FAFAFA] text-[#252B37]"
                          : "text-[#535862] hover:bg-gray-50"
                      }`}
                      style={{ fontFamily: "Avenir Next, sans-serif" }}
                    >
                      {totalPages}
                    </button>
                  );
                }

                return pages;
              })()}
            </div>

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-1 px-2 sm:px-3 py-2 rounded-lg border shadow-sm flex-shrink-0 ${
                currentPage === totalPages
                  ? "bg-white border-[#D5D7DA] text-[#414651] cursor-not-allowed opacity-50"
                  : "bg-white border-[#D5D7DA] text-[#414651] hover:bg-gray-50"
              }`}
            >
              <span className="hidden sm:inline text-sm font-semibold" style={{ fontFamily: "Avenir Next, sans-serif" }}>
                Next
              </span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
