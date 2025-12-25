// src/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
// Ensure AuthState interface includes isLoading
import { useAuthStore, AuthState } from '@/store/useAuthStore';
import { authApi } from '@/lib/api'; // Ensure correct path to api client
import { AuthUser } from '@/types';
// No need for ROUTES here

// Use the imported AuthState type
const AuthContext = createContext<AuthState | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Get state and actions directly from Zustand store
  const store = useAuthStore();
  const { user, isLoading, setUser } = store;

  // Effect to check authentication status on initial load
  useEffect(() => {
    // Only run if currently in the initial loading state
    if (!isLoading) return;

    const checkUser = async () => {
      console.log('[AuthProviderEffect] Checking auth status...');
      // No need to set isLoading true here, store initializes it to true
      try {
        const userData = await authApi.getMe(); // already AuthUser | null
            setUser(userData);
        console.log('[AuthProviderEffect] /me response:', userData);
        setUser(userData); // Update Zustand store (this action sets isLoading false)
      } catch (error) {
        console.error('[AuthProviderEffect] Failed to fetch user:', error);
        setUser(null); // Update Zustand store (this action sets isLoading false)
      }
    };

    checkUser();
    
  }, [isLoading, setUser]); // Dependency ensures effect re-runs if isLoading resets

  console.log('[AuthProvider Render] Zustand State - User:', user, 'isLoading:', isLoading);

  // Provide the Zustand store's state and actions via context
  return (
    <AuthContext.Provider value={store}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to consume the context (provides Zustand store)
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined || context === null) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
