import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { NextResponse } from "next/server";

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
          // Authenticate with Strapi
          const authRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/auth/local`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              identifier: credentials.email,
              password: credentials.password,
            }),
          });

          const authData = await authRes.json();
          if (!authRes.ok) return null;

          // Get the user data with the isAdmin field
          const userRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/users/me`, {
            headers: { Authorization: `Bearer ${authData.jwt}` },
          });

          if (!userRes.ok) return null;
          
          const userData = await userRes.json();
          console.log("User data from Strapi:", userData);
          
          // Use the isAdmin boolean field to determine role
          const role = userData.isAdmin === true ? "admin" : "authenticated";
          console.log(`User ${userData.email} assigned role based on isAdmin field:`, role);

          return {
            id: userData.id,
            name: userData.username,
            email: userData.email,
            jwt: authData.jwt,
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
    async jwt({ token, user }: any) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.jwt = user.jwt;
        token.role = user.role;

        console.log("JWT token created with role:", user.role);

      }
      return token;
    },
    async session({ session, token }: any) {
      // Send properties to the client
      if (session.user) {
        session.user.id = token.id as string;
        session.user.jwt = token.jwt as string;
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