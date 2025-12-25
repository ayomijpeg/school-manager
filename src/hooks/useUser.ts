// src/hooks/useUser.ts
import { useAuth } from './useAuth';

export function useUser() {
  const { user, isLoading } = useAuth(); // Get user data and loading state from AuthProvider

  return {
    user, // The user object { id, email, role, passwordResetRequired } or null
    isLoading, // Boolean indicating if the initial user fetch is happening
    isAuthenticated: !!user && !isLoading, // Simple check if user is loaded and exists
    isAdmin: user?.role === 'ADMIN',
    isTeacher: user?.role === 'TEACHER',
    isStudent: user?.role === 'STUDENT',
    isParent: user?.role === 'PARENT',
    // You can add more specific role checks or combinations if needed
  };
}
