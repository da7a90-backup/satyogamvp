import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";

// Auth options configuration
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Authenticate with FastAPI backend
          const authRes = await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!authRes.ok) {
            console.error("Authentication failed:", authRes.status);
            return null;
          }

          const authData = await authRes.json();

          // Get user data using the access token
          const userRes = await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_URL}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${authData.access_token}`,
              "Content-Type": "application/json"
            },
          });

          if (!userRes.ok) {
            console.error("Failed to fetch user data:", userRes.status);
            return null;
          }

          const userData = await userRes.json();
          console.log("User data from FastAPI:", userData);

          // Determine role based on is_admin field
          const role = userData.is_admin === true ? "admin" : "authenticated";
          console.log(`User ${userData.email} assigned role:`, role);

          return {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            accessToken: authData.access_token,
            refreshToken: authData.refresh_token,
            membershipTier: userData.membership_tier,
            role: role,
          };
        } catch (error) {
          console.error("Error during authentication:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: any) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.membershipTier = user.membershipTier;
        token.role = user.role;

        console.log("JWT token created with role:", user.role, "tier:", user.membershipTier);
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      // Send properties to the client
      if (session.user) {
        session.user.id = token.id as string;
        session.user.accessToken = token.accessToken as string;
        session.user.refreshToken = token.refreshToken as string;
        session.user.membershipTier = token.membershipTier as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login", // Error code passed in query string as ?error=
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };