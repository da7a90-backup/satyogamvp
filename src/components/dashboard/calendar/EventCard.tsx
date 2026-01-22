"use client";

import Link from "next/link";
import Image from "next/image";
import { CalendarEvent } from "@/types/calendar";

interface EventCardProps {
  event: CalendarEvent;
  isHighlighted: boolean;
}

export default function EventCard({ event, isHighlighted }: EventCardProps) {
  // Determine button text and style based on action type and status
  const getButtonConfig = () => {
    if (event.actionType === "join_zoom") {
      if (event.status === "live") {
        return {
          text: "Join zoom",
          style: "bg-[#7D1A13] text-white",
          disabled: false,
          showDot: true,
          dotColor: "#FFFFFF",
        };
      } else {
        return {
          text: "Join zoom",
          style: "bg-white text-[#A4A7AE] border border-[#E9EAEB]",
          disabled: true,
          showDot: true,
          dotColor: "#D5D7DA",
        };
      }
    } else if (event.actionType === "register") {
      return {
        text: "Register now",
        style: "bg-[#7D1A13] text-white",
        disabled: false,
        showDot: false,
      };
    } else if (event.actionType === "expired") {
      return {
        text: "Join zoom",
        style: "bg-white text-[#A4A7AE] border border-[#E9EAEB]",
        disabled: true,
        showDot: true,
        dotColor: "#D5D7DA",
      };
    } else {
      // view_portal or view
      return {
        text: "View",
        style: "bg-[#7D1A13] text-white",
        disabled: false,
        showDot: false,
      };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <div
      className="flex flex-col sm:flex-row items-start p-4 gap-4 sm:gap-6 bg-white rounded-xl border w-full transition-opacity"
      style={{
        borderColor: "#D2D6DB",
        opacity: isHighlighted ? 1 : 0.5,
      }}
    >
      {/* Content */}
      <div className="flex-1 flex flex-col items-start gap-2 w-full sm:w-auto min-w-0">
        {/* Event Title Row */}
        <div className="flex flex-row items-center gap-4 w-full min-w-0">
          {/* Event Image */}
          <div
            className="relative rounded-lg overflow-hidden flex-shrink-0"
            style={{
              width: "56px",
              height: "56px",
            }}
          >
            {event.imageUrl ? (
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}
          </div>

          {/* Event Details */}
          <div className="flex-1 flex flex-col items-start gap-2 min-w-0">
            {/* Title with Live badge */}
            <div className="flex flex-row items-center gap-2 relative flex-wrap">
              <h3
                className="line-clamp-2"
                style={{
                  fontFamily: "Avenir Next, sans-serif",
                  fontWeight: 600,
                  fontSize: "18px",
                  lineHeight: "28px",
                  color: "#000000",
                }}
              >
                {event.title}
              </h3>

              {/* Live Badge */}
              {event.status === "live" && (
                <div
                  className="flex flex-row items-center px-2 py-0.5 gap-1 rounded-md"
                  style={{
                    background: "#EF4444",
                  }}
                >
                  <div
                    style={{
                      width: "17.41px",
                      height: "17.41px",
                      position: "relative",
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="9" cy="9" r="9" fill="white" opacity="0.3" />
                      <circle cx="9" cy="9" r="5" fill="white" />
                    </svg>
                  </div>
                  <span
                    style={{
                      fontFamily: "Avenir Next, sans-serif",
                      fontWeight: 500,
                      fontSize: "16px",
                      lineHeight: "18px",
                      color: "#FFFFFF",
                    }}
                  >
                    Live
                  </span>
                </div>
              )}
            </div>

            {/* Event metadata */}
            <div className="flex flex-row items-center gap-2 flex-wrap">
              {/* Date */}
              <span
                style={{
                  fontFamily: "Avenir Next, sans-serif",
                  fontWeight: 600,
                  fontSize: "14px",
                  lineHeight: "20px",
                  color: "#4D5761",
                }}
              >
                {event.date}
              </span>

              {/* Divider */}
              <div
                style={{
                  width: "0px",
                  height: "20px",
                  border: "1px solid #D0D0D0",
                }}
              />

              {/* Duration */}
              <span
                style={{
                  fontFamily: "Avenir Next, sans-serif",
                  fontWeight: 600,
                  fontSize: "14px",
                  lineHeight: "20px",
                  color: "#4D5761",
                }}
              >
                {event.duration}
              </span>

              {/* Divider */}
              <div
                style={{
                  width: "0px",
                  height: "20px",
                  border: "1px solid #D0D0D0",
                }}
              />

              {/* Location Type */}
              <span
                style={{
                  fontFamily: "Avenir Next, sans-serif",
                  fontWeight: 600,
                  fontSize: "14px",
                  lineHeight: "20px",
                  color: "#4D5761",
                }}
              >
                {event.locationType}
              </span>
            </div>

            {/* Description (if retreat type with description) */}
            {event.type === "retreat" && event.description && (
              <p
                className="line-clamp-3"
                style={{
                  fontFamily: "Avenir Next, sans-serif",
                  fontWeight: 400,
                  fontSize: "16px",
                  lineHeight: "24px",
                  color: "#414651",
                }}
              >
                {event.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <Link href={event.actionUrl} className="w-full sm:w-auto flex-shrink-0">
        <button
          disabled={buttonConfig.disabled}
          className={`flex flex-row justify-center items-center px-4 py-2.5 gap-2 rounded-lg shadow-sm w-full sm:w-auto ${buttonConfig.style}`}
          style={{
            fontFamily: "Avenir Next, sans-serif",
            fontWeight: 600,
            fontSize: "14px",
            lineHeight: "20px",
            boxShadow: buttonConfig.disabled
              ? "0px 1px 2px rgba(10, 13, 18, 0.05)"
              : "0px 1px 2px rgba(16, 24, 40, 0.05), inset 0px 0px 0px 1px rgba(10, 13, 18, 0.18), inset 0px -2px 0px rgba(10, 13, 18, 0.05)",
            cursor: buttonConfig.disabled ? "not-allowed" : "pointer",
            minWidth: "118px",
          }}
        >
          {/* Dot indicator */}
          {buttonConfig.showDot && (
            <div
              style={{
                width: "10px",
                height: "10px",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: "8px",
                  height: "8px",
                  left: "1px",
                  top: "1px",
                  background: buttonConfig.dotColor,
                  borderRadius: "50%",
                }}
              />
            </div>
          )}
          <span>{buttonConfig.text}</span>
        </button>
      </Link>
    </div>
  );
}
