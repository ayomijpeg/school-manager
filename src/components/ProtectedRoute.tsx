// src/components/ProtectedRoute.tsx
'use client'; // Required for hooks (useEffect, useRouter, useAuth)

import React, { useEffect } from 'react'; // Import React if needed
import { useRouter, usePathname } from 'next/navigation'; // Import usePathname
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types'; // Or '@/interfaces'
import { ROUTES } from '@/lib/constant'; // Make sure path is correct ('constants'?)
import Spinner from '@/components/ui/Spinner'; // Assuming you have a Spinner component

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[]; // Optional array of allowed roles
  requireAuth?: boolean; // Whether authentication is strictly required (defaults to true)
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  requireAuth = true, // Default to requiring authentication
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); // Get current path for password reset check

  useEffect(() => {
    // Don't do anything while auth state is loading
    if (isLoading) {
      console.log('[ProtectedRoute] Still loading auth state...');
      return;
    }

    console.log('[ProtectedRoute] Auth loaded. IsAuthenticated:', isAuthenticated, 'User:', user);

    // --- Redirect if Auth Required & Not Authenticated ---
    if (requireAuth && !isAuthenticated) {
      console.log('[ProtectedRoute] Not authenticated, redirecting to login...');
      router.push(ROUTES.LOGIN);
      return; // Stop further checks
    }

    // --- Redirect if Role Not Allowed ---
    // Only check roles if the user *is* authenticated (user object exists)
    if (isAuthenticated && user && allowedRoles && !allowedRoles.includes(user.role)) {
      console.log(`[ProtectedRoute] Role ${user.role} not allowed, redirecting to dashboard...`);
      router.push(ROUTES.DASHBOARD); // Redirect unauthorized users to a safe default
      return; // Stop further checks
    }

    // --- Redirect if Password Change Required ---
    // Only check if the user *is* authenticated
    if (isAuthenticated && user?.passwordResetRequired && pathname !== ROUTES.CHANGE_PASSWORD) {
        console.log('[ProtectedRoute] Password change required, redirecting...');
        // Ensure ROUTES.CHANGE_PASSWORD is correct
        router.push(ROUTES.CHANGE_PASSWORD);
        return; // Stop further checks
    }

    console.log('[ProtectedRoute] Checks passed.');

    // Dependencies for the effect
  }, [user, isLoading, isAuthenticated, requireAuth, allowedRoles, router, pathname]); // Added pathname

  // --- Render Loading State ---
  if (isLoading) {
    // Use your reusable Spinner component
    return <Spinner fullScreen text="Checking authentication..." />;
  }

  // --- Render Null During Redirects (Prevents flashing content) ---
  // If auth is required but not met OR role check failed OR password reset needed (and not on page)
  if (
    (requireAuth && !isAuthenticated) ||
    (isAuthenticated && user && allowedRoles && !allowedRoles.includes(user.role)) ||
    (isAuthenticated && user?.passwordResetRequired && pathname !== ROUTES.CHANGE_PASSWORD)
    ) {
    console.log('[ProtectedRoute] Rendering null while redirect occurs...');
    return null; // Don't render children while redirecting
  }

  // --- Render Protected Content ---
  console.log('[ProtectedRoute] Rendering children.');
  return <>{children}</>;
}
