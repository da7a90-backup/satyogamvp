"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarWidgetProps {
  eventDates: Set<string>;
  selectedDate: Date | null;
  onSelectDate: (date: Date | null) => void;
}

export default function CalendarWidget({
  eventDates,
  selectedDate,
  onSelectDate,
}: CalendarWidgetProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<"upcoming" | "past">("upcoming");

  // Get calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // First day of month
    const firstDay = new Date(year, month, 1);
    // Last day of month
    const lastDay = new Date(year, month + 1, 0);

    // Get day of week for first day (0 = Sunday)
    const startDayOfWeek = firstDay.getDay();

    // Get previous month days to fill the first week
    const prevMonthDays: Date[] = [];
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      prevMonthDays.push(date);
    }

    // Get current month days
    const currentMonthDays: Date[] = [];
    for (let day = 1; day <= lastDay.getDate(); day++) {
      currentMonthDays.push(new Date(year, month, day));
    }

    // Get next month days to fill the last week
    const nextMonthDays: Date[] = [];
    const totalDays = prevMonthDays.length + currentMonthDays.length;
    const remainingDays = 42 - totalDays; // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      nextMonthDays.push(new Date(year, month + 1, day));
    }

    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  }, [currentMonth]);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const handleDateClick = (date: Date) => {
    if (selectedDate && selectedDate.toDateString() === date.toDateString()) {
      // Deselect if clicking the same date
      onSelectDate(null);
    } else {
      onSelectDate(date);
    }
  };

  const today = new Date();
  const isToday = (date: Date) => date.toDateString() === today.toDateString();
  const isSelected = (date: Date) =>
    selectedDate && date.toDateString() === selectedDate.toDateString();
  const hasEvent = (date: Date) => eventDates.has(date.toDateString());
  const isCurrentMonth = (date: Date) =>
    date.getMonth() === currentMonth.getMonth();

  return (
    <div
      className="flex flex-col items-center p-0 bg-white rounded-xl border shadow-sm w-full lg:w-auto lg:flex-shrink-0"
      style={{
        maxWidth: "400px",
        borderColor: "#D2D6DB",
        boxShadow: "0px 1px 2px rgba(10, 13, 18, 0.05)",
      }}
    >
      {/* Content */}
      <div className="flex flex-col items-center p-6 gap-5 w-full">
        {/* Calendar */}
        <div className="flex flex-col items-start gap-12 w-full">
          {/* Calendar Header */}
          <div className="flex flex-col items-start gap-3 w-full">
            {/* Month Navigation */}
            <div className="flex flex-row justify-between items-center pb-1 gap-14 w-full">
              {/* Prev Button */}
              <button
                onClick={handlePrevMonth}
                className="flex flex-row justify-center items-center p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                style={{
                  width: "32px",
                  height: "32px",
                }}
              >
                <ChevronLeft size={20} className="text-gray-400" strokeWidth={1.67} />
              </button>

              {/* Month/Year */}
              <span
                className="text-center"
                style={{
                  fontFamily: "Avenir Next, sans-serif",
                  fontWeight: 600,
                  fontSize: "16px",
                  lineHeight: "24px",
                  color: "#414651",
                  width: "102px",
                }}
              >
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>

              {/* Next Button */}
              <button
                onClick={handleNextMonth}
                className="flex flex-row justify-center items-center p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                style={{
                  width: "32px",
                  height: "32px",
                }}
              >
                <ChevronRight
                  size={20}
                  className="text-gray-400"
                  strokeWidth={1.67}
                />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="flex flex-col items-start gap-1 w-full">
              {/* Day names */}
              <div className="grid grid-cols-7 gap-0 w-full">
                {dayNames.map((day, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-center"
                    style={{
                      width: "40px",
                      height: "40px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "Avenir Next, sans-serif",
                        fontWeight: 600,
                        fontSize: "14px",
                        lineHeight: "20px",
                        color: "#414651",
                        textAlign: "center",
                      }}
                    >
                      {day}
                    </span>
                  </div>
                ))}
              </div>

              {/* Calendar dates */}
              <div className="grid grid-cols-7 gap-1 w-full">
                {calendarDays.map((date, index) => {
                  const isTodayDate = isToday(date);
                  const isSelectedDate = isSelected(date);
                  const hasEventDate = hasEvent(date);
                  const isCurrentMonthDate = isCurrentMonth(date);

                  return (
                    <button
                      key={index}
                      onClick={() => handleDateClick(date)}
                      className="relative flex items-center justify-center cursor-pointer transition-colors"
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "20px",
                        background: isSelectedDate
                          ? "#F5F5F5"
                          : isTodayDate
                          ? "#F5F5F5"
                          : "transparent",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Avenir Next, sans-serif",
                          fontWeight: isCurrentMonthDate
                            ? isTodayDate || isSelectedDate
                              ? 500
                              : 400
                            : 400,
                          fontSize: "14px",
                          lineHeight: "20px",
                          color: isCurrentMonthDate ? "#414651" : "#717680",
                          textAlign: "center",
                        }}
                      >
                        {date.getDate()}
                      </span>

                      {/* Event dot indicator */}
                      {hasEventDate && isCurrentMonthDate && (
                        <div
                          style={{
                            position: "absolute",
                            width: "5px",
                            height: "5px",
                            bottom: "4px",
                            background: "#942017",
                            borderRadius: "50%",
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Upcoming/Past Toggle */}
          <div
            className="flex flex-row items-start p-0 border rounded-lg"
            style={{
              borderColor: "#D5D7DA",
              boxShadow:
                "inset 0px 0px 0px 1px rgba(10, 13, 18, 0.18), inset 0px -2px 0px rgba(10, 13, 18, 0.05)",
              filter: "drop-shadow(0px 1px 2px rgba(16, 24, 40, 0.05))",
              width: "161px",
            }}
          >
            {/* Upcoming Button */}
            <button
              onClick={() => setViewMode("upcoming")}
              className="flex flex-row justify-center items-center px-4 py-2 gap-2 flex-1 rounded-l-lg transition-colors"
              style={{
                height: "40px",
                background: viewMode === "upcoming" ? "#FAFAFA" : "#FFFFFF",
                borderRight: "1px solid #D5D7DA",
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontSize: "14px",
                lineHeight: "20px",
                color: viewMode === "upcoming" ? "#252B37" : "#414651",
              }}
            >
              Upcoming
            </button>

            {/* Past Button */}
            <button
              onClick={() => setViewMode("past")}
              className="flex flex-row justify-center items-center px-4 py-2 gap-2 flex-1 rounded-r-lg transition-colors"
              style={{
                height: "40px",
                background: viewMode === "past" ? "#FAFAFA" : "#FFFFFF",
                fontFamily: "Avenir Next, sans-serif",
                fontWeight: 600,
                fontSize: "14px",
                lineHeight: "20px",
                color: viewMode === "past" ? "#252B37" : "#414651",
              }}
            >
              Past
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
