'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { ROUTES } from '@/lib/constant'; 
import { toast } from 'sonner';

export function useAuth() {
  const { user, isLoading, setUser, setIsLoading } = useAuthStore();
  const router = useRouter();

  const isAuthenticated = !isLoading && !!user;

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // 1. Call Login API
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Login failed');

      // 2. Update Store immediately (No second fetch needed)
      const userData = data.user;
      setUser(userData); 

      // 3. Handle Intelligent Routing
      if (userData.passwordResetRequired) {
        toast.warning("Security Update Required", { description: "Please set a new password." });
        router.push('/auth/new-password'); // Or ROUTES.CHANGE_PASSWORD
        return userData; // Return so the UI knows to stop
      } 
      
      // 4. Standard Dashboard Redirect
      // Note: We send EVERYONE to /dashboard. 
      // The DashboardClient inside that page handles showing the correct Admin/Student view.
      toast.success(`Welcome back, ${userData.fullName.split(' ')[0]}`);
      router.push('/dashboard'); 
      
      return userData;

    } catch (error: any) {
      console.error('[Login Error]:', error);
      setUser(null);
      throw error; // Let the Login Page handle the error toast
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' }); // Ensure this route exists
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      router.push('/auth/login');
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
  };
}
