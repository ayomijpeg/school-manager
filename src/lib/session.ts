import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/auth'; // Ensure this path is correct
// import { User } from ... (keep your existing imports)

export async function getCurrentUser() {
  try {
    // FIX: Add 'await' here
    const cookieStore = await cookies(); 
    
    const token = cookieStore.get('token')?.value || cookieStore.get('session')?.value;

    if (!token) return null;

    const payload = await verifyJwt(token);

    if (!payload) return null;

    // Return the user data structure expected by your app
    return {
      id: (payload.userId || payload.id || payload.sub) as string,
      email: payload.email as string,
      role: payload.role as string,
      // Add other fields if your verifyJwt returns them
    };
  } catch (error) {
    console.error("Session Error:", error);
    return null;
  }
}
