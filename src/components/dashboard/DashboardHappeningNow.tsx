'use client';

import { useEffect, useState } from 'react';
import HappeningNowCard from './retreat/HappeningNowCard';

export default function DashboardHappeningNow() {
  const [happeningNow, setHappeningNow] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHappeningNow = async () => {
      try {
        const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

        console.log('Fetching happening now from calendar API...');

        // No authentication required for happening-now endpoint
        const response = await fetch(`${FASTAPI_URL}/api/events/happening-now`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('Happening now response status:', response.status);

        // Handle all response statuses gracefully
        if (!response.ok) {
          if (response.status === 404) {
            console.log('No happening now events found (404)');
            return; // Silent fail for 404
          }

          // Log but don't throw for other errors
          console.warn(`Happening now API returned ${response.status}`);
          return;
        }

        const data = await response.json();
        console.log('Happening now data:', data);

        if (data.happening_now) {
          setHappeningNow(data.happening_now);
          console.log('Set happening now:', data.happening_now);
        } else {
          console.log('No happening now event at this time');
        }
      } catch (error) {
        // Only log unexpected errors (network issues, etc.)
        console.error('Unexpected error fetching happening now:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHappeningNow();
  }, []);

  if (loading) {
    return null; // Or a loading skeleton
  }

  if (!happeningNow) {
    return null; // No happening now event
  }

  // For backward compatibility, check if this is the old retreat format or new event format
  const isEventFormat = happeningNow.type === 'event' || happeningNow.type === 'session';

  if (!isEventFormat && happeningNow.session && happeningNow.retreat) {
    // Old retreat format - use existing card
    return (
      <div className="w-full">
        <HappeningNowCard
          session={happeningNow.session}
          retreatTitle={happeningNow.retreat.title}
          variant="dashboard"
        />
      </div>
    );
  }

  // New event format - for now, just return null until we implement event card
  // TODO: Implement HappeningNowEventCard component
  console.log('Event format happening now not yet implemented:', happeningNow);
  return null;
}
