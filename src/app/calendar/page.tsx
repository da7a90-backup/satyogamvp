// app/(main)/calendar/page.tsx
import { Metadata } from 'next';
import CalendarPage from '@/components/calendar/Calendar';

export const metadata: Metadata = {
  title: 'Calendar - Sat Yoga',
  description: 'Explore upcoming retreats, events, and activities at Sat Yoga Ashram.',
};

// This is a server component that fetches events from the API
export default async function CalendarPageRoute() {
  // In a real implementation, you would fetch events from your Strapi API
  // For this example, we'll use mock data
  
  // Example of how you would fetch from Strapi:
  // const data = await fetchAPI('/events?populate=*&sort=startDate:asc');
  
  // Mock data for demonstration with correct type assertions

  
  return <CalendarPage/>;
}