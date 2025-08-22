'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

// Import our dedicated dashboard components
import BrandDashboard from './brand/page';
import ExecutorDashboard from './executor/page';

// A simple loading component for a better user experience
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="text-white text-lg">Loading Your Dashboard...</div>
  </div>
);

interface UserProfile {
  role: 'brand' | 'executor' | null;
}

export default function DashboardRouterPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      // Wait for the Clerk session to be loaded before we can get a token
      if (!isLoaded) return;

      setIsLoading(true);
      try {
        const token = await getToken();
        if (!token) {
          // If no token, it's a side effect, so we redirect here.
          router.push('/sign-in');
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get-user-profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user profile.');
        }
        
        const data: UserProfile = await response.json();
        
        // --- THIS IS THE CRITICAL FIX ---
        // If the user has no role, it's a side effect that requires a redirect.
        // We handle it here, inside the useEffect hook.
        if (!data.role) {
          router.push('/role-selection');
          return; // Stop further execution in this hook
        }

        // If everything is okay, we set the profile state.
        setProfile(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [isLoaded, getToken, router]); // The effect re-runs if these values change

  // --- The Render Logic is now much simpler ---

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-center text-red-400 p-10">Error: {error}</div>;
  }

  // By the time we get here, we are GUARANTEED to have a profile with a role.
  // The useEffect hook has already handled the cases where a redirect is needed.
  if (profile?.role === 'brand') {
    return <BrandDashboard />;
  }

  if (profile?.role === 'executor') {
    return <ExecutorDashboard />;
  }

  // This fallback is now just a safety net and should rarely, if ever, be seen.
  return <LoadingSpinner />;
}