import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function DashboardPage() {
    // Get the user session
    const session = await getServerSession(authOptions);
    
    // Debug - log the session to see what we're working with
    console.log("Dashboard redirect - session:", JSON.stringify({
      authenticated: !!session,
      user: session?.user,
      role: session?.user?.role,
    }, null, 2));
    
    // Redirect based on user role
    if (!session) {
      // Not authenticated, redirect to login
      console.log("No session, redirecting to login");
      redirect('/login');
    } else if (session.user?.role === 'admin') {
      // Admin users go to admin dashboard
      console.log("Admin user detected, redirecting to admin dashboard");
      redirect('/dashboard/admin');
    } else {
      // Regular users go to user dashboard
      console.log("Regular user detected, redirecting to user dashboard");
      redirect('/dashboard/user');
    }
  }