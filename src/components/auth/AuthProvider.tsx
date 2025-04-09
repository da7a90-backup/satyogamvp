'use client';

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

type AuthProviderProps = {
  children: React.ReactNode;
  session?: Session | null;
};

/**
 * Auth provider wrapper for the application
 * This component provides the NextAuth session to all child components
 */
export default function AuthProvider({
  children,
  session,
}: AuthProviderProps) {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}