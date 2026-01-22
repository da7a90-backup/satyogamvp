"use client";

import { useMemo } from "react";
import { CalendarEvent } from "@/types/calendar";
import EventCard from "./EventCard";

interface EventListProps {
  events: CalendarEvent[];
  selectedDate: Date | null;
}

interface GroupedEvent {
  dateHeader: string;
  dayOfWeek: string;
  events: CalendarEvent[];
}

export default function EventList({ events, selectedDate }: EventListProps) {
  // Group events by date
  const groupedEvents = useMemo(() => {
    const groups: { [key: string]: CalendarEvent[] } = {};

    events.forEach((event) => {
      if (event.startDate) {
        const date = new Date(event.startDate);
        const key = date.toDateString();
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(event);
      }
    });

    // Convert to array and sort by date
    const result: GroupedEvent[] = Object.entries(groups)
      .sort(([dateA], [dateB]) => {
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      })
      .map(([dateKey, events]) => {
        const date = new Date(dateKey);
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
        const dayNames = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];

        const month = monthNames[date.getMonth()];
        const day = date.getDate();
        const suffix =
          day === 1 || day === 21 || day === 31
            ? "st"
            : day === 2 || day === 22
            ? "nd"
            : day === 3 || day === 23
            ? "rd"
            : "th";

        return {
          dateHeader: `${month} ${day}${suffix}`,
          dayOfWeek: dayNames[date.getDay()],
          events,
        };
      });

    return result;
  }, [events]);

  if (groupedEvents.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-16">
        <p
          style={{
            fontFamily: "Avenir Next, sans-serif",
            fontSize: "16px",
            lineHeight: "24px",
            color: "#717680",
          }}
        >
          {selectedDate
            ? "No events on this date"
            : "No events in your calendar"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-start gap-12">
      {groupedEvents.map((group, groupIndex) => (
        <div key={groupIndex} className="flex flex-row items-start gap-2 w-full">
          {/* Timeline Column */}
          <div
            className="flex flex-col justify-center items-center gap-2"
            style={{
              width: "19px",
              alignSelf: "stretch",
            }}
          >
            {/* Date header dot */}
            <div className="flex flex-row justify-center items-center gap-2.5">
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  background: "#414651",
                  borderRadius: "50%",
                }}
              />
            </div>

            {/* Connecting line (if not last group or has multiple events) */}
            {(groupIndex < groupedEvents.length - 1 || group.events.length > 1) && (
              <div
                style={{
                  width: "0px",
                  flex: 1,
                  border: "1px solid #A4A7AE",
                }}
              />
            )}
          </div>

          {/* Content Column */}
          <div className="flex-1 flex flex-col items-start gap-4">
            {/* Date Header */}
            <div className="flex flex-row items-start gap-4">
              <h2
                style={{
                  fontFamily: "Avenir Next, sans-serif",
                  fontWeight: 600,
                  fontSize: "18px",
                  lineHeight: "28px",
                  color: "#181D27",
                }}
              >
                {group.dateHeader} {group.dayOfWeek}
              </h2>
            </div>

            {/* Events for this date */}
            <div className="flex flex-col items-start gap-4 w-full">
              {group.events.map((event, eventIndex) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isHighlighted={!selectedDate}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
