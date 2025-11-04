"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Heart, Clock, Search, ChevronLeft, ChevronRight, Filter, X } from "lucide-react";
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
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<string>("teachings");
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
  const paginatedTeachings = filteredTeachings.slice(startIndex, startIndex + itemsPerPage);

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
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col bg-[#FAF8F1] min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col px-8 pt-8 gap-6 border-b border-[#E5E7EB]">
        <div className="flex flex-col gap-5">
          {/* Page header */}
          <div className="flex items-center justify-between gap-4">
            <h1
              className="text-[24px] leading-[32px] font-[550] text-[#181D27]"
              style={{ fontFamily: "Optima, serif" }}
            >
              Library
            </h1>

            <div className="flex items-center gap-3">
              {/* Search Input */}
              <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#D5D7DA] rounded-lg shadow-sm w-[320px]">
                <Search className="w-5 h-5 text-[#717680]" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={handleSearch}
                  className="flex-1 text-base text-[#717680] outline-none bg-transparent"
                  style={{ fontFamily: "Avenir Next, sans-serif" }}
                />
                <div className="px-1 py-0.5 border border-[#E9EAEB] rounded text-xs text-[#717680] mix-blend-multiply">
                  ⌘K
                </div>
              </div>

              {/* Filter Button */}
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50 transition-colors ${
                    showFilters ? "border-[#7D1A13] bg-[#7D1A13]/5" : "border-[#D5D7DA]"
                  }`}
                >
                  <Filter className="w-5 h-5 text-[#717680]" />
                  <span className="text-sm font-medium text-[#181D27]">Filters</span>
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
      <div className="flex flex-col p-8 gap-6">
        {/* Featured Teaching */}
        {currentFeaturedTeaching && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2
                className="text-[20px] leading-[28px] font-semibold text-[#181D27]"
                style={{ fontFamily: "Avenir Next, sans-serif" }}
              >
                {activeTab === "teachings" && "Latest teaching"}
                {activeTab === "guided_meditations" && "Guided Meditation of the Month"}
                {activeTab === "essays" && "Featured Essay"}
                {activeTab === "qas" && "Latest Q&A"}
              </h2>
              <button
                className="px-4 py-2 text-sm font-semibold text-[#535862] rounded-lg hover:bg-gray-50"
                style={{ fontFamily: "Avenir Next, sans-serif" }}
              >
                View all
              </button>
            </div>

            {/* Featured Card */}
            <div className="flex bg-white border border-[#D1D1D1] rounded-lg overflow-hidden">
              {/* Thumbnail */}
              <div className="relative w-[560px] h-[331px] flex-shrink-0 cursor-pointer" onClick={() => router.push(`/dashboard/user/teachings/${currentFeaturedTeaching.slug}`)}>
                <Image
                  src={currentFeaturedTeaching.thumbnail_url || "/default-thumbnail.jpg"}
                  alt={currentFeaturedTeaching.title}
                  fill
                  className="object-cover"
                />
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="ml-1">
                      <path d="M8 5L19 12L8 19V5Z" fill="#942017" />
                    </svg>
                  </div>
                </div>
                {/* Favorite button */}
                <button
                  onClick={(e) => toggleFavorite(currentFeaturedTeaching.id, e)}
                  className="absolute top-4 right-4 p-4 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20"
                >
                  <Heart
                    className={`w-5 h-5 ${favorites.has(currentFeaturedTeaching.id) ? "fill-red-500 text-red-500" : "text-white"}`}
                  />
                </button>
                {/* Video badge */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2 py-1 bg-black/40 backdrop-blur-sm rounded">
                  <span className="text-[10px] font-medium text-[#F3F4F6]">Video</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col justify-between p-6 flex-1">
                <div className="flex flex-col gap-6">
                  {/* Meta */}
                  <div className="flex items-center gap-6">
                    <span className="text-sm font-semibold text-[#7D1A13]" style={{ fontFamily: "Avenir Next, sans-serif" }}>
                      {formatDate(currentFeaturedTeaching.published_date)}
                    </span>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#384250]" />
                      <span className="text-sm font-semibold text-[#384250]" style={{ fontFamily: "Avenir Next, sans-serif" }}>
                        {formatDuration(currentFeaturedTeaching.duration)}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    className="text-[20px] leading-[30px] font-semibold text-black"
                    style={{ fontFamily: "Avenir Next, sans-serif" }}
                  >
                    {currentFeaturedTeaching.title}
                  </h3>

                  {/* Description */}
                  <p
                    className="text-base leading-[24px] text-[#535862] line-clamp-5"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {currentFeaturedTeaching.description}
                  </p>
                </div>

                {/* Open Button */}
                <button
                  onClick={() => router.push(`/dashboard/user/teachings/${currentFeaturedTeaching.slug}`)}
                  className="self-start px-4 py-2 bg-[#942017] text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-[#7D1A13]"
                  style={{ fontFamily: "Avenir Next, sans-serif" }}
                >
                  Open
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
          <div className="flex items-center justify-between">
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setActiveSubTab("all")}
                className={`px-3 py-2 text-sm font-semibold rounded-lg border-b-2 ${
                  activeSubTab === "all"
                    ? "border-[#942017] text-[#7D1A13]"
                    : "border-transparent text-[#717680] hover:bg-gray-50"
                }`}
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                All
              </button>
              <button
                onClick={() => setActiveSubTab("free")}
                className={`px-3 py-2 text-sm font-semibold rounded-lg border-b-2 ${
                  activeSubTab === "free"
                    ? "border-[#942017] text-[#7D1A13]"
                    : "border-transparent text-[#717680] hover:bg-gray-50"
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

          {/* Teaching Cards Grid */}
          {isLoading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="grid grid-cols-3 gap-8">
              {paginatedTeachings.map((teaching) => (
                <div
                  key={teaching.id}
                  className="flex flex-col bg-white border border-[#D2D6DB] rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/dashboard/user/teachings/${teaching.slug}`)}
                >
                  {/* Thumbnail */}
                  <div className="relative w-full h-[202px]">
                    <Image
                      src={teaching.thumbnail_url || "/default-thumbnail.jpg"}
                      alt={teaching.title}
                      fill
                      className="object-cover"
                    />
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-0.5">
                          <path d="M5 3L13 8L5 13V3Z" fill="#942017" />
                        </svg>
                      </div>
                    </div>
                    {/* Badge */}
                    <div className="absolute top-3 left-2 px-2 py-1 bg-white border border-[#D5D7DA] rounded-md shadow-sm">
                      <span className="text-sm font-medium text-[#414651]" style={{ fontFamily: "Avenir Next, sans-serif" }}>
                        {teaching.category === "video_teaching" && "Teaching"}
                        {teaching.category === "guided_meditation" && "Meditation"}
                        {teaching.category === "qa" && "Q&A"}
                        {teaching.category === "essay" && "Essay"}
                      </span>
                    </div>
                    {/* Favorite button */}
                    <button
                      onClick={(e) => toggleFavorite(teaching.id, e)}
                      className="absolute top-2 right-2 p-4 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20"
                    >
                      <Heart
                        className={`w-5 h-5 ${favorites.has(teaching.id) ? "fill-red-500 text-red-500" : "text-white"}`}
                      />
                    </button>
                    {/* Video badge */}
                    <div className="absolute bottom-3 left-2 flex items-center gap-2 px-2 py-1 bg-black/40 backdrop-blur-sm rounded">
                      <span className="text-[10px] font-medium text-[#F3F4F6]">Video</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-6 p-6">
                    <div className="flex flex-col gap-2">
                      {/* Meta */}
                      <div className="flex items-center gap-6">
                        <span className="text-sm font-semibold text-[#7D1A13]" style={{ fontFamily: "Avenir Next, sans-serif" }}>
                          {formatDate(teaching.published_date)}
                        </span>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#384250]" />
                          <span className="text-sm font-semibold text-[#384250]" style={{ fontFamily: "Avenir Next, sans-serif" }}>
                            {formatDuration(teaching.duration)}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3
                        className="text-[20px] leading-[30px] font-semibold text-black line-clamp-1"
                        style={{ fontFamily: "Avenir Next, sans-serif" }}
                      >
                        {teaching.title}
                      </h3>

                      {/* Description */}
                      <p
                        className="text-base leading-[24px] text-[#384250] line-clamp-2"
                        style={{ fontFamily: "Avenir Next, sans-serif" }}
                      >
                        {teaching.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-5 border-t border-[#E9EAEB]">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg border shadow-sm ${
                currentPage === 1
                  ? "bg-white border-[#E9EAEB] text-[#A4A7AE] cursor-not-allowed"
                  : "bg-white border-[#E9EAEB] text-[#A4A7AE] hover:bg-gray-50"
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-semibold" style={{ fontFamily: "Avenir Next, sans-serif" }}>
                Previous
              </span>
            </button>

            {/* Page Numbers */}
            <div className="flex gap-0.5">
              {(() => {
                const pages = [];
                const showEllipsisStart = currentPage > 4;
                const showEllipsisEnd = currentPage < totalPages - 3;

                // Always show first page
                if (totalPages > 0) {
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
                }

                // Show ellipsis after first page if needed
                if (showEllipsisStart) {
                  pages.push(
                    <span key="ellipsis-start" className="w-10 h-10 flex items-center justify-center text-[#535862]">
                      ...
                    </span>
                  );
                }

                // Show pages around current page
                const startPage = showEllipsisStart ? Math.max(2, currentPage - 1) : 2;
                const endPage = showEllipsisEnd ? Math.min(totalPages - 1, currentPage + 1) : totalPages - 1;

                for (let i = startPage; i <= endPage; i++) {
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

                // Show ellipsis before last page if needed
                if (showEllipsisEnd) {
                  pages.push(
                    <span key="ellipsis-end" className="w-10 h-10 flex items-center justify-center text-[#535862]">
                      ...
                    </span>
                  );
                }

                // Always show last page if there's more than 1 page
                if (totalPages > 1) {
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
              className={`flex items-center gap-1 px-3 py-2 rounded-lg border shadow-sm ${
                currentPage === totalPages
                  ? "bg-white border-[#D5D7DA] text-[#414651] cursor-not-allowed opacity-50"
                  : "bg-white border-[#D5D7DA] text-[#414651] hover:bg-gray-50"
              }`}
            >
              <span className="text-sm font-semibold" style={{ fontFamily: "Avenir Next, sans-serif" }}>
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
