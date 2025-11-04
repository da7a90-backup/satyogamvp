'use client'

import { useState } from 'react';
import { Calendar, MapPin, Globe, Flag } from 'lucide-react';
import StandardSection from '../shared/StandardSection';
// Event data interface
export interface EventData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  date: string;
  startDate?: string;
  endDate?: string;
  duration: string;
  locationType: 'Onsite' | 'Online';
  location: string;
  eventUrl: string;
}

// Month grouping interface
export interface MonthGroup {
  month: string;
  events: EventData[];
}

// Standard Section Component 
interface StandardSectionData {
  tagline?: string;
  title?: string;
  description?: string;
  ctabuttontext?: string;
  ctabuttonurl?: string;
}



// Event Card Component
const EventCard = ({ event }: { event: EventData }) => {
  return (
    <div 
      className="flex flex-col lg:flex-row justify-center items-start lg:items-center w-full"
      style={{ gap: '32px' }}
    >
      {/* Left side - Image and Content */}
      <div 
        className="flex flex-col lg:flex-row items-start w-full"
        style={{ gap: '24px', flex: 1 }}
      >
        {/* Event Image */}
        <div
          style={{
            width: '100%',
            maxWidth: '208px',
            height: '208px',
            borderRadius: '8px',
            background: `linear-gradient(161.66deg, rgba(0, 0, 0, 0) 49.24%, #000000 111.29%), url(${event.imageUrl})`,
            backgroundColor: '#D5D7DA',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            flexShrink: 0
          }}
        >
          {/* Icon Badge */}
          <div
            style={{
              position: 'absolute',
              width: '48px',
              height: '48px',
              right: '7px',
              bottom: '8px',
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.28) 100%)',
              backdropFilter: 'blur(26.25px)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div style={{ 
              width: '24px', 
              height: '24px',
              background: 'linear-gradient(180deg, #FFFFFF 0%, #9C7E27 100%)',
              borderRadius: '50%'
            }} />
          </div>
        </div>

        {/* Content */}
        <div
          className="flex flex-col items-start w-full"
          style={{ gap: '24px' }}
        >
          {/* Title and Description */}
          <div
            className="flex flex-col items-start w-full"
            style={{ gap: '8px' }}
          >
            {/* Title */}
            <h3
              style={{
                fontFamily: 'Avenir Next',
                fontWeight: 600,
                fontSize: '30px',
                lineHeight: '38px',
                color: '#000000'
              }}
            >
              {event.title}
            </h3>

            {/* Subtitle */}
            <p
              style={{
                fontFamily: 'Avenir Next',
                fontWeight: 600,
                fontSize: '16px',
                lineHeight: '140%',
                color: '#942017'
              }}
            >
              {event.subtitle}
            </p>

            {/* Description */}
            <p
              style={{
                fontFamily: 'Avenir Next',
                fontWeight: 400,
                fontSize: '16px',
                lineHeight: '24px',
                color: '#384250',
                maxWidth: '758px'
              }}
            >
              {event.description}
            </p>
          </div>

          {/* View Event Button */}
          <button
            onClick={() => window.location.href = event.eventUrl}
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '8px 12px',
              gap: '4px',
              background: '#7D1A13',
              boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05), inset 0px 0px 0px 1px rgba(10, 13, 18, 0.18), inset 0px -2px 0px rgba(10, 13, 18, 0.05)',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <span
              style={{
                fontFamily: 'Avenir Next',
                fontWeight: 600,
                fontSize: '14px',
                lineHeight: '20px',
                color: '#FFFFFF'
              }}
            >
              View event
            </span>
          </button>
        </div>
      </div>

      {/* Divider - hidden on mobile */}
      <div
        className="hidden lg:block"
        style={{
          width: '1px',
          height: '208px',
          background: '#D2D6DB',
          flexShrink: 0
        }}
      />

      {/* Right side - Event Details */}
      <div
        className="flex flex-col items-start"
        style={{
          gap: '24px',
          width: '100%',
          maxWidth: '194px'
        }}
      >
        {/* Location Type */}
        <div
          className="flex flex-row items-center"
          style={{ gap: '8px' }}
        >
          <Flag size={16} color="#535862" strokeWidth={1.5} />
          <span
            style={{
              fontFamily: 'Avenir Next',
              fontWeight: 600,
              fontSize: '18px',
              lineHeight: '28px',
              color: '#384250'
            }}
          >
            {event.locationType}
          </span>
        </div>

        {/* Date */}
        <div
          className="flex flex-row items-center"
          style={{ gap: '8px' }}
        >
          <Calendar size={16} color="#535862" strokeWidth={1.5} />
          <span
            style={{
              fontFamily: 'Avenir Next',
              fontWeight: 600,
              fontSize: '18px',
              lineHeight: '28px',
              color: '#384250'
            }}
          >
            {event.date}
          </span>
        </div>

        {/* Duration/Location */}
        <div
          className="flex flex-row items-center"
          style={{ gap: '8px' }}
        >
          {event.locationType === 'Online' ? (
            <Globe size={16} color="#535862" strokeWidth={1.5} />
          ) : (
            <MapPin size={16} color="#535862" strokeWidth={1.5} />
          )}
          <span
            style={{
              fontFamily: 'Avenir Next',
              fontWeight: 600,
              fontSize: '18px',
              lineHeight: '28px',
              color: '#384250'
            }}
          >
            {event.duration}
          </span>
        </div>
      </div>
    </div>
  );
};

// Main Component
interface CalendarPageProps {
  events?: EventData[];
}

const CalendarPage = ({ events = [] }: CalendarPageProps) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'onsite' | 'online'>('all');

  // Standard section data
  const standardSectionData: StandardSectionData = {
    tagline: 'CALENDAR',
    title: 'Upcoming retreats',
    description: 'Step away from the noise of the world. Join us in sacred space—at the Ashram or online—for retreats that awaken the Soul and illuminate the path to Truth.'
  };

  // Group events by month
  const groupEventsByMonth = (events: EventData[]): MonthGroup[] => {
    const monthGroups: { [key: string]: EventData[] } = {};

    events.forEach(event => {
      // Extract month from date string (e.g., "Dec 14, 2024" -> "December")
      const date = new Date(event.startDate || event.date);
      const monthName = date.toLocaleDateString('en-US', { month: 'long' });

      if (!monthGroups[monthName]) {
        monthGroups[monthName] = [];
      }
      monthGroups[monthName].push(event);
    });

    // Convert to array and sort by month
    const monthOrder = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return Object.keys(monthGroups)
      .sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b))
      .map(month => ({
        month,
        events: monthGroups[month]
      }));
  };

  const eventsData: MonthGroup[] = groupEventsByMonth(events);

  const filteredEvents = eventsData.map(monthGroup => ({
    ...monthGroup,
    events: monthGroup.events.filter(event => {
      if (activeFilter === 'all') return true;
      return event.locationType.toLowerCase() === activeFilter;
    })
  })).filter(monthGroup => monthGroup.events.length > 0);

  const totalEvents = filteredEvents.reduce((acc, month) => acc + month.events.length, 0);

  return (
    <div className="w-full" style={{ backgroundColor: '#FAF8F1' }}>
      {/* Standard Section */}
      <StandardSection data={standardSectionData} />

      {/* Calendar Section */}
      <section
        className="w-full flex flex-col items-center px-4 lg:px-16 pb-16"
        style={{ backgroundColor: '#FAF8F1' }}
      >
        <div
          className="w-full flex flex-col items-start"
          style={{
            maxWidth: '1312px',
            gap: '24px'
          }}
        >
          {/* Filter Buttons */}
          <div
            className="flex flex-col justify-center items-center w-full"
            style={{ gap: '32px' }}
          >
            <div
              className="flex flex-col items-center"
              style={{
                gap: '8px',
                paddingBottom: '8px',
                borderBottom: '1px solid #E9EAEB'
              }}
            >
              <div
                style={{
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  padding: '0px',
                  isolation: 'isolate',
                  width: '238px',
                  height: '40px',
                  border: '1px solid #D5D7DA',
                  boxShadow: 'inset 0px 0px 0px 1px rgba(10, 13, 18, 0.18), inset 0px -2px 0px rgba(10, 13, 18, 0.05)',
                  filter: 'drop-shadow(0px 1px 2px rgba(16, 24, 40, 0.05))',
                  borderRadius: '8px'
                }}
              >
                {/* View all */}
                <button
                  onClick={() => setActiveFilter('all')}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '8px 16px',
                    gap: '8px',
                    flex: 1,
                    height: '40px',
                    background: activeFilter === 'all' ? '#7D1A13' : '#FFFFFF',
                    borderRight: '1px solid #D5D7DA',
                    border: 'none',
                    cursor: 'pointer',
                    borderTopLeftRadius: '8px',
                    borderBottomLeftRadius: '8px',
                    fontFamily: 'Inter',
                    fontWeight: 600,
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: activeFilter === 'all' ? '#FFFFFF' : '#414651',
                    transition: 'all 0.2s'
                  }}
                >
                  View all
                </button>

                {/* Onsite */}
                <button
                  onClick={() => setActiveFilter('onsite')}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '8px 16px',
                    gap: '8px',
                    flex: 1,
                    height: '40px',
                    background: activeFilter === 'onsite' ? '#7D1A13' : '#FFFFFF',
                    borderRight: '1px solid #D5D7DA',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'Inter',
                    fontWeight: 600,
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: activeFilter === 'onsite' ? '#FFFFFF' : '#414651',
                    transition: 'all 0.2s'
                  }}
                >
                  Onsite
                </button>

                {/* Online */}
                <button
                  onClick={() => setActiveFilter('online')}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '8px 16px',
                    gap: '8px',
                    flex: 1,
                    height: '40px',
                    background: activeFilter === 'online' ? '#7D1A13' : '#FFFFFF',
                    border: 'none',
                    cursor: 'pointer',
                    borderTopRightRadius: '8px',
                    borderBottomRightRadius: '8px',
                    fontFamily: 'Inter',
                    fontWeight: 600,
                    fontSize: '14px',
                    lineHeight: '20px',
                    color: activeFilter === 'online' ? '#FFFFFF' : '#414651',
                    transition: 'all 0.2s'
                  }}
                >
                  Online
                </button>
              </div>
            </div>
          </div>

          {/* Event Count */}
          <div
            className="flex flex-col items-start w-full"
            style={{ gap: '8px' }}
          >
            <span
              style={{
                fontFamily: 'Avenir Next',
                fontWeight: 600,
                fontSize: '18px',
                lineHeight: '28px',
                color: '#111927'
              }}
            >
              {totalEvents} events
            </span>
          </div>

          {/* Events List */}
          <div
            className="flex flex-col items-start w-full"
            style={{ gap: '64px', marginTop: '32px' }}
          >
            {filteredEvents.map((monthGroup, index) => (
              <div
                key={index}
                className="flex flex-col items-start w-full"
                style={{ gap: '32px' }}
              >
                {/* Month Header */}
                <h2
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 700,
                    fontSize: '32px',
                    lineHeight: '150%',
                    color: '#000000'
                  }}
                >
                  {monthGroup.month}
                </h2>

                {/* Month Events */}
                <div
                  className="flex flex-col items-start w-full"
                  style={{ gap: '48px' }}
                >
                  {monthGroup.events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CalendarPage;