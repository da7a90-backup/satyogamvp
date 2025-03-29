'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Types
export interface Event {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  description: string;
  startDate: string;
  endDate?: string;
  duration: {
    value: number;
    unit: 'days' | 'weeks' | 'months'
  };
  location: 'Onsite' | 'Online';
  imageUrl?: string;
  teacher?: string;
  isSoldOut?: boolean;
}

export type EventFilterType = 'all' | 'onsite' | 'online';

// Event Card Component
interface EventCardProps {
  event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  // Format start date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Format duration for display
  const formatDuration = (duration: Event['duration']) => {
    if (duration.value === 1) {
      return `${duration.value} ${duration.unit.slice(0, -1)}`;
    }
    return `${duration.value} ${duration.unit}`;
  };
  
  return (
    <div className="flex flex-col md:flex-row gap-6 py-6 border-b border-gray-200">
      <div className="md:w-24 h-24 relative bg-gray-200 rounded flex-shrink-0">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover rounded"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg 
              className="h-10 w-10 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
          </div>
        )}
      </div>
      
      <div className="flex-grow">
        <h3 className="text-lg font-bold mb-1">{event.title}</h3>
        
        {event.subtitle && (
          <p className="text-sm text-gray-600 mb-2">{event.subtitle}</p>
        )}
        
        <p className="text-gray-700 mb-4 line-clamp-3">
          {event.description}
        </p>
        
        <Link
          href={`/events/${event.slug}`}
          className="inline-flex items-center text-gray-700 font-medium hover:text-purple-700"
        >
          View event
          <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      
      <div className="md:w-48 flex-shrink-0 flex flex-col md:text-right">
        <div className="mb-2">
          <div className="text-sm font-medium">Start: {formatDate(event.startDate)}</div>
          
          <div className="flex items-center mt-1 justify-start md:justify-end">
            {event.duration && (
              <div className="flex items-center text-sm text-gray-600 mr-3 md:ml-3 md:mr-0">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formatDuration(event.duration)}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="inline-flex items-center mt-2 bg-gray-100 rounded-full px-3 py-1 text-xs font-medium text-gray-700 justify-start md:justify-end md:self-end">
          {event.location}
        </div>
      </div>
    </div>
  );
};

// Event Filter Component
interface EventFilterProps {
  activeFilter: EventFilterType;
  onFilterChange: (filter: EventFilterType) => void;
}

export const EventFilter: React.FC<EventFilterProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  return (
    <div className="inline-flex rounded-md shadow-sm mb-8">
      <button
        onClick={() => onFilterChange('all')}
        className={`px-4 py-2 text-sm font-medium rounded-l-md ${
          activeFilter === 'all'
            ? 'bg-gray-100 text-gray-900'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        } border border-gray-300`}
      >
        View all
      </button>
      <button
        onClick={() => onFilterChange('onsite')}
        className={`px-4 py-2 text-sm font-medium ${
          activeFilter === 'onsite'
            ? 'bg-gray-100 text-gray-900'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        } border-t border-b border-r border-gray-300`}
      >
        Onsite
      </button>
      <button
        onClick={() => onFilterChange('online')}
        className={`px-4 py-2 text-sm font-medium rounded-r-md ${
          activeFilter === 'online'
            ? 'bg-gray-100 text-gray-900'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        } border-t border-b border-r border-gray-300`}
      >
        Online
      </button>
    </div>
  );
};

// Event Controls Component
interface EventControlsProps {
  totalEvents: number;
  onSortChange: (sort: string) => void;
  onFilterClick: () => void;
}

export const EventControls: React.FC<EventControlsProps> = ({
  totalEvents,
  onSortChange,
  onFilterClick,
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="text-sm text-gray-600">
        <span className="font-medium">{totalEvents}</span> events
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center text-sm">
          <span className="mr-2">Sort by</span>
          <select 
            onChange={(e) => onSortChange(e.target.value)}
            className="py-1 px-2 border border-gray-300 rounded-md bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="date-asc">Date (Ascending)</option>
            <option value="date-desc">Date (Descending)</option>
            <option value="duration">Duration</option>
          </select>
        </div>
        
        <button
          onClick={onFilterClick}
          className="flex items-center py-1 px-3 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </button>
      </div>
    </div>
  );
};

// Event Month Group Component
interface EventMonthGroupProps {
  month: string;
  events: Event[];
}

export const EventMonthGroup: React.FC<EventMonthGroupProps> = ({ month, events }) => {
  if (events.length === 0) return null;
  
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6">{month}</h2>
      <div className="divide-y divide-gray-200">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};

// Main Calendar Page Component
interface CalendarPageProps {
  initialEvents?: Event[];
  initialFilter?: EventFilterType;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({
  initialEvents = [],
  initialFilter = 'all',
}) => {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(initialEvents);
  const [activeFilter, setActiveFilter] = useState<EventFilterType>(initialFilter);
  const [sortBy, setSortBy] = useState('date-asc');
  
  // Filter events based on active filter
  const filterEvents = (filter: EventFilterType, allEvents: Event[]) => {
    if (filter === 'all') {
      return allEvents;
    } else {
      return allEvents.filter(event => event.location.toLowerCase() === filter);
    }
  };
  
  // Sort events based on the selected sort option
  const sortEvents = (eventsToSort: Event[], sortOption: string) => {
    const sortedEvents = [...eventsToSort];
    
    switch (sortOption) {
      case 'date-asc':
        return sortedEvents.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      case 'date-desc':
        return sortedEvents.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      case 'duration':
        return sortedEvents.sort((a, b) => {
          // Convert duration to days for comparison
          const getDaysValue = (duration: Event['duration']) => {
            switch (duration.unit) {
              case 'days': return duration.value;
              case 'weeks': return duration.value * 7;
              case 'months': return duration.value * 30;
              default: return duration.value;
            }
          };
          
          return getDaysValue(b.duration) - getDaysValue(a.duration);
        });
      default:
        return sortedEvents;
    }
  };
  
  // Apply filtering and sorting
  useEffect(() => {
    let result = filterEvents(activeFilter, events);
    result = sortEvents(result, sortBy);
    setFilteredEvents(result);
  }, [activeFilter, events, sortBy]);
  
  // Group events by month
  const groupEventsByMonth = (eventsToGroup: Event[]) => {
    const months: Record<string, Event[]> = {};
    
    // Get all months from the current date forward for the next year
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    for (let i = 0; i < 12; i++) {
      const monthIndex = (currentMonth + i) % 12;
      const year = currentYear + Math.floor((currentMonth + i) / 12);
      const monthName = new Date(year, monthIndex, 1).toLocaleString('en-US', { month: 'long' });
      months[monthName] = [];
    }
    
    // Group events by month
    eventsToGroup.forEach(event => {
      const date = new Date(event.startDate);
      const monthName = date.toLocaleString('en-US', { month: 'long' });
      
      if (months[monthName]) {
        months[monthName].push(event);
      }
    });
    
    // Remove empty months
    Object.keys(months).forEach(month => {
      if (months[month].length === 0) {
        delete months[month];
      }
    });
    
    return months;
  };
  
  // Group events by month
  const eventsByMonth = groupEventsByMonth(filteredEvents);
  
  // Handle filter change
  const handleFilterChange = (filter: EventFilterType) => {
    setActiveFilter(filter);
  };
  
  // Handle sort change
  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };
  
  // Handle filter button click
  const handleFilterClick = () => {
    // This would typically open a filter modal or dropdown
    console.log('Filter button clicked');
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <div className="text-purple-600 text-sm font-medium mb-2">Calendar</div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Upcoming retreats</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.
        </p>
      </div>
      
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <EventFilter
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />
        
        <EventControls
          totalEvents={filteredEvents.length}
          onSortChange={handleSortChange}
          onFilterClick={handleFilterClick}
        />
      </div>
      
      {Object.keys(eventsByMonth).length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No events found matching your criteria.</p>
        </div>
      ) : (
        Object.entries(eventsByMonth).map(([month, monthEvents]) => (
          <EventMonthGroup
            key={month}
            month={month}
            events={monthEvents}
          />
        ))
      )}
    </div>
  );
};

// Event Detail Page Component
interface EventDetailPageProps {
  event: Event;
  relatedEvents?: Event[];
}

export const EventDetailPage: React.FC<EventDetailPageProps> = ({
  event,
  relatedEvents = [],
}) => {
  if (!event) return null;
  
  // Format start date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Format duration for display
  const formatDuration = (duration: Event['duration']) => {
    if (duration.value === 1) {
      return `${duration.value} ${duration.unit.slice(0, -1)}`;
    }
    return `${duration.value} ${duration.unit}`;
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/calendar" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8">
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Calendar
      </Link>
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
          
          {event.subtitle && (
            <p className="text-xl text-gray-600 mb-4">{event.subtitle}</p>
          )}
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDate(event.startDate)}</span>
            </div>
            
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formatDuration(event.duration)}</span>
            </div>
            
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{event.location}</span>
            </div>
            
            {event.teacher && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Guided by {event.teacher}</span>
              </div>
            )}
          </div>
        </div>
        
        {event.imageUrl && (
          <div className="relative aspect-video mb-8 rounded-lg overflow-hidden">
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
        
        <div className="prose prose-lg max-w-none mb-12">
          <div dangerouslySetInnerHTML={{ __html: event.description }} />
        </div>
        
        <div className="bg-gray-50 rounded-lg p-6 mb-12">
          <h2 className="text-xl font-bold mb-4">Event Details</h2>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-600 mb-1">Date</div>
              <div>{formatDate(event.startDate)}</div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-600 mb-1">Duration</div>
              <div>{formatDuration(event.duration)}</div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-600 mb-1">Location</div>
              <div>{event.location}</div>
            </div>
            
            {event.teacher && (
              <div>
                <div className="text-sm font-medium text-gray-600 mb-1">Teacher</div>
                <div>{event.teacher}</div>
              </div>
            )}
          </div>
          
          <div className="mt-6">
            <button
              className={`w-full py-3 rounded-md font-medium text-center ${
                event.isSoldOut
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
              disabled={event.isSoldOut}
            >
              {event.isSoldOut ? 'Sold Out' : 'Register Now'}
            </button>
          </div>
        </div>
        
        {relatedEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Other Upcoming Events</h2>
            <div className="divide-y divide-gray-200">
              {relatedEvents.map((relatedEvent) => (
                <EventCard key={relatedEvent.id} event={relatedEvent} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Export all the components
//export { EventCard, EventFilter, EventControls, EventMonthGroup, CalendarPage, EventDetailPage };