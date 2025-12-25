// src/store/useAuthStore.ts
import { create } from 'zustand';
import { AuthUser } from '@/types'; // Import your specific user type

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean; // Add loading state
  setUser: (user: AuthUser | null) => void;
  setIsLoading: (loading: boolean) => void;
  // Add login/logout actions directly here if preferred
  // login: (user: AuthUser) => void;
  // logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true, // Start as loading
  setUser: (user) => set({ user, isLoading: false }), // Set loading false when user known
  setIsLoading: (loading) => set({ isLoading: loading }),
  // login: (user) => set({ user, isLoading: false }),
  // logout: () => set({ user: null, isLoading: false }),
}));
