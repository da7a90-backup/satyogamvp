/**
 * Sync NextAuth session token to localStorage for FastAPI backend calls
 */

import { Session } from 'next-auth';

export function syncSessionToLocalStorage(session: Session | null) {
  if (typeof window === 'undefined') return;

  if (session?.user?.accessToken) {
    localStorage.setItem('access_token', session.user.accessToken as string);

    if (session.user.refreshToken) {
      localStorage.setItem('refresh_token', session.user.refreshToken as string);
    }
  } else {
    // Clear tokens if no session
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}
