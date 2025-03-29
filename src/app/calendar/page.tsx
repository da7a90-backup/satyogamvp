// app/(main)/calendar/page.tsx
import { Metadata } from 'next';
import { CalendarPage } from '@/components/calendar/Calendar';
import { Event } from '@/components/calendar/Calendar';  // Import the Event type
import { fetchAPI } from '@/lib/api';

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
  const events: Event[] = [
    {
      id: '1',
      title: 'Sevadhari',
      slug: 'sevadhari-december',
      subtitle: 'Subtitle',
      description: 'Lorem ipsum dolor sit amet consectetur. Sit cras viverra vivamus aliquet pharetra enim. Condimentum pellentesque suspendisse tellus nisi. Consequat pellentesque diam volutpat sed sed. Posuere elementum ac adipiscing.',
      startDate: '2024-12-14T10:00:00Z',
      duration: {
        value: 6,
        unit: 'months' // Explicitly use the correct union type value
      },
      location: 'Onsite' as 'Onsite', // Type assertion for the union type
      imageUrl: '',
    },
    {
      id: '2',
      title: 'Online Retreat Guided by Shunyamurti',
      slug: 'online-retreat-december',
      subtitle: 'Subtitle',
      description: 'Lorem ipsum dolor sit amet consectetur. Sit cras viverra vivamus aliquet pharetra enim. Condimentum pellentesque suspendisse tellus nisi. Consequat pellentesque diam volutpat sed sed. Posuere elementum ac adipiscing.',
      startDate: '2024-12-14T14:00:00Z',
      duration: {
        value: 7,
        unit: 'days' // Explicitly use the correct union type value
      },
      location: 'Online' as 'Online', // Type assertion for the union type
      imageUrl: '',
      teacher: 'Shunyamurti',
    },
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
    {
      id: '5',
      title: 'Sevadhari',
      slug: 'sevadhari-february',
      subtitle: 'Subtitle',
      description: 'Lorem ipsum dolor sit amet consectetur. Sit cras viverra vivamus aliquet pharetra enim. Condimentum pellentesque suspendisse tellus nisi. Consequat pellentesque diam volutpat sed sed. Posuere elementum ac adipiscing.',
      startDate: '2025-02-14T14:00:00Z',
      duration: {
        value: 6,
        unit: 'months' // Explicitly use the correct union type value
      },
      location: 'Onsite' as 'Onsite', // Type assertion for the union type
      imageUrl: '',
    },
    {
      id: '6',
      title: 'Shakti Saturation',
      slug: 'shakti-saturation-march',
      subtitle: 'Subtitle',
      description: 'Lorem ipsum dolor sit amet consectetur. Sit cras viverra vivamus aliquet pharetra enim. Condimentum pellentesque suspendisse tellus nisi. Consequat pellentesque diam volutpat sed sed. Posuere elementum ac adipiscing.',
      startDate: '2025-03-14T10:00:00Z',
      duration: {
        value: 1,
        unit: 'months' // Explicitly use the correct union type value
      },
      location: 'Onsite' as 'Onsite', // Type assertion for the union type
      imageUrl: '',
    },
    {
      id: '7',
      title: 'Sevadhari',
      slug: 'sevadhari-march',
      subtitle: 'Subtitle',
      description: 'Lorem ipsum dolor sit amet consectetur. Sit cras viverra vivamus aliquet pharetra enim. Condimentum pellentesque suspendisse tellus nisi. Consequat pellentesque diam volutpat sed sed. Posuere elementum ac adipiscing.',
      startDate: '2025-03-14T14:00:00Z',
      duration: {
        value: 6,
        unit: 'months' // Explicitly use the correct union type value
      },
      location: 'Onsite' as 'Onsite', // Type assertion for the union type
      imageUrl: '',
    },
  ];
  
  return <CalendarPage initialEvents={events} />;
}