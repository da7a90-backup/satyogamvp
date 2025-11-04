// app/(main)/calendar/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EventDetailPage, Event } from '@/components/calendar/Calendar';

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

interface EventPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getEvent(slug: string) {
  try {
    const response = await fetch(`${FASTAPI_URL}/api/events/${slug}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
}

async function getRelatedEvents() {
  try {
    const response = await fetch(`${FASTAPI_URL}/api/events?limit=3`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.events || [];
  } catch (error) {
    console.error('Error fetching related events:', error);
    return [];
  }
}

// Generate metadata for the event
export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const eventData = await getEvent(slug);

  if (!eventData) {
    return {
      title: 'Event Not Found - Sat Yoga',
    };
  }

  return {
    title: `${eventData.title} - Sat Yoga Calendar`,
    description: eventData.subtitle || eventData.description,
  };
}

export default async function EventPageRoute({ params }: EventPageProps) {
  const { slug } = await params;

  const eventData = await getEvent(slug);
  const relatedEventsData = await getRelatedEvents();

  if (!eventData) {
    notFound();
  }

  // Transform API data to Event format
  const event: Event = {
    id: eventData.id,
    title: eventData.title,
    slug: eventData.slug,
    subtitle: eventData.subtitle,
    description: eventData.description,
    startDate: eventData.startDate,
    duration: {
      value: parseInt(eventData.duration.split(' ')[0]) || 1,
      unit: eventData.duration.includes('day') ? 'days' : eventData.duration.includes('month') ? 'months' : 'hours'
    },
    location: eventData.location as 'Online' | 'Onsite',
    imageUrl: eventData.imageUrl,
    teacher: eventData.teacher,
  };

  // Transform related events
  const relatedEvents: Event[] = relatedEventsData
    .filter((e: any) => e.slug !== slug)
    .slice(0, 2)
    .map((e: any) => ({
      id: e.id,
      title: e.title,
      slug: e.slug,
      subtitle: e.subtitle,
      description: e.description,
      startDate: e.startDate,
      duration: {
        value: parseInt(e.duration.split(' ')[0]) || 1,
        unit: e.duration.includes('day') ? 'days' : e.duration.includes('month') ? 'months' : 'hours'
      },
      location: e.location as 'Online' | 'Onsite',
      imageUrl: e.imageUrl,
      teacher: e.teacher,
    }));

  return <EventDetailPage event={event} relatedEvents={relatedEvents} />;
}