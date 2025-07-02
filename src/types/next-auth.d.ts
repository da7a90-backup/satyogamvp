// types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      jwt: string
      role: string
      membership: string
      membershipstatus?: string
      membershipstartdate?: string
      membershipenddate?: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    jwt: string
    role: string
    membership: string
    membershipstatus?: string
    membershipstartdate?: string
    membershipenddate?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    jwt: string
    role: string
    membership: string
    membershipstatus?: string
    membershipstartdate?: string
    membershipenddate?: string
  }
}