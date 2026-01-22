"use client";

import { useState, useMemo } from "react";
import { Search, Filter } from "lucide-react";
import { CalendarResponse, CalendarEvent } from "@/types/calendar";
import EventList from "./calendar/EventList";
import CalendarWidget from "./calendar/CalendarWidget";

interface UserCalendarClientProps {
  initialEvents: CalendarResponse;
}

export default function UserCalendarClient({
  initialEvents,
}: UserCalendarClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "enrolled">("all");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter events based on search, tab, and selected date
  const filteredEvents = useMemo(() => {
    let events = initialEvents.events;

    // Search filter
    if (searchQuery) {
      events = events.filter((event) =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Date filter (when calendar date is selected)
    if (selectedDate) {
      events = events.filter((event) => {
        if (!event.startDate) return false;
        const eventDate = new Date(event.startDate);
        return (
          eventDate.toDateString() === selectedDate.toDateString()
        );
      });
    }

    return events;
  }, [initialEvents.events, searchQuery, selectedDate]);

  // Get unique dates that have events (for calendar widget)
  const eventDates = useMemo(() => {
    const dates = new Set<string>();
    initialEvents.events.forEach((event) => {
      if (event.startDate) {
        const date = new Date(event.startDate);
        dates.add(date.toDateString());
      }
    });
    return dates;
  }, [initialEvents.events]);

  return (
    <div
      className="w-full flex flex-col items-start p-0"
      style={{
        background: "#FAF8F1",
        minHeight: "100vh",
      }}
    >
      {/* Header Section */}
      <div
        className="flex flex-col items-start px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8 pb-0 gap-4 lg:gap-6 w-full"
        style={{
          maxWidth: "100%",
        }}
      >
        {/* Container with bottom border */}
        <div
          className="flex flex-col items-start p-0 gap-5 w-full"
          style={{
            borderBottom: "1px solid #E5E7EB",
            paddingBottom: "20px",
          }}
        >
          {/* Page header with title and search */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full">
            {/* Title */}
            <div className="flex-1">
              <h1
                style={{
                  fontFamily: "Optima, sans-serif",
                  fontWeight: 550,
                  fontSize: "24px",
                  lineHeight: "32px",
                  color: "#181D27",
                }}
              >
                Your calendar
              </h1>
            </div>

            {/* Search Input */}
            <div
              className="flex flex-row items-center px-3 py-2 gap-2 bg-white rounded-lg border shadow-sm w-full lg:w-auto"
              style={{
                maxWidth: "320px",
                borderColor: "#D5D7DA",
                boxShadow: "0px 1px 2px rgba(10, 13, 18, 0.05)",
              }}
            >
              <Search className="text-gray-500" size={20} strokeWidth={1.67} />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 outline-none text-base bg-transparent"
                style={{
                  fontFamily: "Avenir Next, sans-serif",
                  color: "#717680",
                }}
              />
            </div>
          </div>

          {/* Tabs */}
          <div
            className="flex flex-row items-start p-0 gap-3"
            style={{
              borderBottom: "1px solid #E9EAEB",
            }}
          >
            {/* All Tab */}
            <button
              onClick={() => setActiveTab("all")}
              className="flex flex-row justify-center items-center px-1 pb-3 gap-2"
              style={{
                borderBottom:
                  activeTab === "all" ? "2px solid #942017" : "2px solid transparent",
              }}
            >
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: "14px",
                  lineHeight: "20px",
                  color: activeTab === "all" ? "#7D1A13" : "#717680",
                }}
              >
                All
              </span>
            </button>

            {/* Enrolled Tab */}
            <button
              onClick={() => setActiveTab("enrolled")}
              className="flex flex-row justify-center items-center px-1 pb-3 gap-2"
              style={{
                borderBottom:
                  activeTab === "enrolled"
                    ? "2px solid #942017"
                    : "2px solid transparent",
              }}
            >
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: "14px",
                  lineHeight: "20px",
                  color: activeTab === "enrolled" ? "#7D1A13" : "#717680",
                }}
              >
                Enrolled
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col items-start px-4 sm:px-6 lg:px-8 py-6 lg:py-8 gap-4 lg:gap-6 w-full">
        {/* Event count and action buttons */}
        <div className="flex flex-row items-center gap-4 w-full">
          {/* Event count */}
          <div className="flex-1">
            <span
              style={{
                fontFamily: "Avenir Next, sans-serif",
                fontWeight: 600,
                fontSize: "12px",
                lineHeight: "18px",
                color: "#111927",
              }}
            >
              {filteredEvents.length} events
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-row items-center gap-2">
            {/* Sort by */}
            <button
              className="flex flex-row justify-center items-center px-3 py-2 gap-1 rounded-lg"
              style={{
                fontFamily: "Avenir Next, sans-serif",
                fontWeight: 600,
                fontSize: "14px",
                lineHeight: "20px",
                color: "#535862",
              }}
            >
              Sort by
            </button>

            {/* Filters */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex flex-row justify-center items-center px-3 py-2 gap-1 bg-white rounded-lg border shadow-sm"
              style={{
                borderColor: "#D5D7DA",
                boxShadow:
                  "0px 1px 2px rgba(16, 24, 40, 0.05), inset 0px 0px 0px 1px rgba(10, 13, 18, 0.18), inset 0px -2px 0px rgba(10, 13, 18, 0.05)",
              }}
            >
              <Filter size={20} strokeWidth={1.67} className="text-gray-700" />
              <span
                style={{
                  fontFamily: "Avenir Next, sans-serif",
                  fontWeight: 600,
                  fontSize: "14px",
                  lineHeight: "20px",
                  color: "#414651",
                }}
              >
                Filters
              </span>
            </button>
          </div>
        </div>

        {/* Main Content: Event List + Calendar Widget */}
        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-20 w-full overflow-hidden">
          {/* Event List */}
          <EventList events={filteredEvents} selectedDate={selectedDate} />

          {/* Calendar Widget */}
          <CalendarWidget
            eventDates={eventDates}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </div>
      </div>
    </div>
  );
}
