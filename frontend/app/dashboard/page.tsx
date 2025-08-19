'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

// --- IMPORT our new, dedicated dashboard components ---
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
      if (!isLoaded) return;

      try {
        const token = await getToken();
        if (!token) {
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

        if (!data.role) {
          router.push('/role-selection');
          return;
        }

        setProfile(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [isLoaded, getToken, router]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-center text-red-400 p-10">Error: {error}</div>;
  }

  // The switch now renders our full components, which will be correctly styled.
  switch (profile?.role) {
    case 'brand':
      return <BrandDashboard />;
    case 'executor':
      return <ExecutorDashboard />;
    default:
      router.push('/role-selection');
      return <LoadingSpinner />; // Show loading while redirecting
  }
}