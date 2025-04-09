import { useSession } from "next-auth/react";

/**
 * A custom hook to handle authentication in components
 * 
 * @returns Authentication data and helper functions
 */
export function useAuth() {
  const { data: session, status } = useSession();
  
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  const isAdmin = session?.user?.role === 'admin';
  
  return {
    session,
    status,
    isLoading,
    isAuthenticated,
    isAdmin,
    user: session?.user,
  };
}

export default useAuth;