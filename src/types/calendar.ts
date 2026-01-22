export interface CalendarEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  startDate: string | null;
  endDate: string | null;
  date: string; // Formatted date string like "Dec 19, 2024"
  duration: string;
  type: "event" | "retreat";
  eventType: string; // satsang, book_group, live_event, retreat, online, onsite_darshan, etc.
  location: string;
  locationType: "Online" | "Onsite";
  imageUrl: string;
  status: "live" | "upcoming" | "past";
  actionUrl: string;
  actionType: "join_zoom" | "view_portal" | "view" | "expired" | "register";
  isRecurring: boolean;
  recurrenceRule: any | null;
  // Retreat-specific fields
  registrationStatus?: string;
  accessType?: string;
  canAccess?: boolean;
}

export interface CalendarResponse {
  events: CalendarEvent[];
  total: number;
  skip: number;
  limit: number;
}

export interface GroupedEvents {
  [date: string]: CalendarEvent[];
}
