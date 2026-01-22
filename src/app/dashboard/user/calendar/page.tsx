import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getMyCalendar } from "@/lib/calendar-api";
import UserCalendarClient from "@/components/dashboard/UserCalendarClient";

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  try {
    // Fetch calendar data
    const calendarData = await getMyCalendar(session.user.accessToken as string);

    return <UserCalendarClient initialEvents={calendarData} />;
  } catch (error) {
    console.error("Error fetching calendar:", error);
    // Return empty data if fetch fails
    return (
      <UserCalendarClient
        initialEvents={{ events: [], total: 0, skip: 0, limit: 100 }}
      />
    );
  }
}
