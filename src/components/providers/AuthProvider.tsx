// src/components/providers/AuthProvider.tsx (Or rename to AuthInitializer.tsx)
'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore'; // Import Zustand hook
import { authApi } from '@/lib/api';
//import { AuthUser } from '@/types';

// This component doesn't need to provide a context anymore,
// it just runs an effect to initialize the Zustand store.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Get actions/state from Zustand store
  const { user, isLoading, setUser } = useAuthStore();

  useEffect(() => {
    // Only check if loading state is currently true (initial load)
    if (!isLoading) return;

    const checkUser = async () => {
      console.log('[AuthProviderEffect] Checking auth status...');
      // No need to set isLoading true here, store initializes it to true
      try {
        const userData = await authApi.getMe(); // already AuthUser | null
        setUser(userData);
        console.log('[AuthProviderEffect] /me response:', userData);
        setUser(userData); // Update Zustand store, this sets isLoading false
      } catch (error) {
        console.error('[AuthProviderEffect] Failed to fetch user:', error);
        setUser(null); // Update Zustand store, this sets isLoading false
      }
      // No need for finally setIsLoading(false) if setUser handles it
    };

    checkUser();
    
  }, [isLoading, setUser]); // Re-run if isLoading changes (though unlikely needed)

   // Log state changes from the store
   console.log('[AuthProvider Render] Zustand State - User:', user, 'isLoading:', isLoading);


  // Render children directly, context provider not needed here
  return <>{children}</>;
}

// REMOVE AuthContext and useAuthContext from this file if they were here.
// Keep them only if you explicitly want to provide the Zustand store via context,
// but it's simpler for components to use useAuthStore directly.
