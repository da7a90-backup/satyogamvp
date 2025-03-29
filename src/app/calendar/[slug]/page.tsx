// app/(main)/calendar/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EventDetailPage, Event } from '@/components/calendar/Calendar';
import { fetchAPI } from '@/lib/api';

interface EventPageProps {
  params: {
    slug: string;
  };
}

// Generate metadata for the event
export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const slug = params.slug;
  
  // In a real implementation, you would fetch the event from your Strapi API
  // const data = await fetchAPI(`/events?filters[slug][$eq]=${slug}&populate=*`);
  
  // If no event is found, return a generic title
  // if (!data || !data.data || data.data.length === 0) {
  //   return {
  //     title: 'Event Not Found - Sat Yoga',
  //   };
  // }
  
  // const event = data.data[0].attributes;
  
  // For this example, we'll use mock data
  const event = {
    title: 'Online Retreat Guided by Shunyamurti',
    subtitle: 'Deepen your meditation practice',
  };
  
  return {
    title: `${event.title} - Sat Yoga Calendar`,
    description: event.subtitle,
  };
}

export default async function EventPageRoute({ params }: EventPageProps) {
  const slug = params.slug;
  
  // In a real implementation, you would fetch the event from your Strapi API
  // const data = await fetchAPI(`/events?filters[slug][$eq]=${slug}&populate=*`);
  
  // if (!data || !data.data || data.data.length === 0) {
  //   notFound();
  // }
  
  // const event = data.data[0].attributes;
  
  // Mock data for demonstration with correct type assertions
  const event: Event = {
    id: '2',
    title: 'Online Retreat Guided by Shunyamurti',
    slug: 'online-retreat-december',
    subtitle: 'Deepen your meditation practice',
    description: `
      <p>Lorem ipsum dolor sit amet consectetur. Sit cras viverra vivamus aliquet pharetra enim. Condimentum pellentesque suspendisse tellus nisi. Consequat pellentesque diam volutpat sed sed. Posuere elementum ac adipiscing.</p>
      <p>Join us for a transformative 7-day online retreat guided by Shunyamurti, focused on deepening your meditation practice and exploring the nature of consciousness. This retreat is suitable for both beginners and experienced meditators.</p>
      <p>During this retreat, you will:</p>
      <ul>
        <li>Learn advanced meditation techniques</li>
        <li>Participate in daily guided practice sessions</li>
        <li>Engage in Q&A sessions with Shunyamurti</li>
        <li>Connect with a community of like-minded seekers</li>
      </ul>
      <p>All sessions will be conducted via Zoom, and recordings will be available for participants who cannot attend live due to time zone differences.</p>
    `,
    startDate: '2024-12-14T14:00:00Z',
    duration: {
      value: 7,
      unit: 'days' // Explicitly use the correct union type value
    },
    location: 'Online' as 'Online', // Type assertion for the union type
    imageUrl: '',
    teacher: 'Shunyamurti',
  };
  
  // Mock related events with correct type assertions
  const relatedEvents: Event[] = [
    {
      id: '3',
      title: 'Online Retreat Guided by Shunyamurti',
      slug: 'online-retreat-january',
      subtitle: 'Subtitle',
      description: 'Lorem ipsum dolor sit amet consectetur. Sit cras viverra vivamus aliquet pharetra enim. Condimentum pellentesque suspendisse tellus nisi. Consequat pellentesque diam volutpat sed sed. Posuere elementum ac adipiscing.',
      startDate: '2025-01-14T14:00:00Z',
      duration: {
        value: 7,
        unit: 'days' // Explicitly use the correct union type value
      },
      location: 'Online' as 'Online', // Type assertion for the union type
      imageUrl: '',
      teacher: 'Shunyamurti',
    },
    {
      id: '4',
      title: 'Shakti Saturation',
      slug: 'shakti-saturation-february',
      subtitle: 'Subtitle',
      description: 'Lorem ipsum dolor sit amet consectetur. Sit cras viverra vivamus aliquet pharetra enim. Condimentum pellentesque suspendisse tellus nisi. Consequat pellentesque diam volutpat sed sed. Posuere elementum ac adipiscing.',
      startDate: '2025-02-14T10:00:00Z',
      duration: {
        value: 1,
        unit: 'months' // Explicitly use the correct union type value
      },
      location: 'Onsite' as 'Onsite', // Type assertion for the union type
      imageUrl: '',
    },
  ];
  
  // If the request slug doesn't match the event slug, return 404
  if (slug !== event.slug) {
    notFound();
  }
  
  return <EventDetailPage event={event} relatedEvents={relatedEvents} />;
}