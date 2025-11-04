// app/(main)/calendar/page.tsx
import { Metadata } from 'next';
import CalendarPage from '@/components/calendar/Calendar';

export const metadata: Metadata = {
  title: 'Calendar - Sat Yoga',
  description: 'Explore upcoming retreats, events, and activities at Sat Yoga Ashram.',
};

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

async function getEvents() {
  try {
    const response = await fetch(`${FASTAPI_URL}/api/events`, {
      cache: 'no-store', // Always fetch fresh data
    });

    if (!response.ok) {
      console.error('Failed to fetch events:', response.statusText);
      return { events: [], total: 0 };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching events:', error);
    return { events: [], total: 0 };
  }
}

// This is a server component that fetches events from the API
export default async function CalendarPageRoute() {
  const { events } = await getEvents();

  return <CalendarPage events={events} />;
}