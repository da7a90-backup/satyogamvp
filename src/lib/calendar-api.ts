import { CalendarResponse } from "@/types/calendar";

const FASTAPI_URL =
  process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";

export async function getMyCalendar(
  token: string,
  params?: {
    upcoming_only?: boolean;
    event_type?: string;
    skip?: number;
    limit?: number;
  }
): Promise<CalendarResponse> {
  const searchParams = new URLSearchParams();

  if (params?.upcoming_only !== undefined) {
    searchParams.append("upcoming_only", params.upcoming_only.toString());
  }
  if (params?.event_type) {
    searchParams.append("event_type", params.event_type);
  }
  if (params?.skip !== undefined) {
    searchParams.append("skip", params.skip.toString());
  }
  if (params?.limit !== undefined) {
    searchParams.append("limit", params.limit.toString());
  }

  const url = `${FASTAPI_URL}/api/users/my-calendar${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch calendar: ${response.statusText}`);
  }

  return response.json();
}
