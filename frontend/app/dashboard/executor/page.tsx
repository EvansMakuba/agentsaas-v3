'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// --- TypeScript Interfaces ---
interface Task {
  id: string;
  submission_url: string;
  submission_body: string;
  reward_usd: number;
  task_tier: number;
}

interface UserProfile {
  role: 'brand' | 'executor' | null;
  balance_usd: number;
  trust_tier?: number;
  reddit_profile_status?: 'pending_analysis' | 'analysis_complete' | 'analysis_failed';
  reddit_credentials?: object;
  reddit_profile_error?: string;
  reddit_profile?: {
    username: string;
    total_karma: number;
    account_age_days: number;
  };
} 

// --- Reusable Components ---
const TaskCard = ({ task }: { task: Task }) => {
  const handleClaimTask = () => {
    toast.success(`(WIP) Claiming task for $${task.reward_usd.toFixed(2)}!`);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 transition-all hover:border-blue-500 shadow-lg">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-400">Comment on post:</p>
          <a href={task.submission_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-400 hover:underline break-words">
            {task.submission_url}
          </a>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-bold text-green-400 text-xl">${task.reward_usd.toFixed(2)}</p>
          <p className="text-xs text-gray-400">Tier {task.task_tier}</p>
        </div>
      </div>
      <div className="mt-3 bg-gray-900 p-3 rounded-md border border-gray-700">
        <p className="text-sm font-semibold text-gray-300 mb-2">Suggested Comment:</p>
        <p className="text-sm text-gray-200 whitespace-pre-wrap font-mono">{task.submission_body}</p>
      </div>
      <div className="mt-4 flex justify-end">
        <button onClick={handleClaimTask} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-md text-sm transition-transform transform hover:scale-105">
          Claim Task
        </button>
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="text-center py-10 text-gray-400">Loading your dashboard...</div>
);

// =====================================================================================
// Main ExecutorDashboard Component
// =====================================================================================
export default function ExecutorDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getToken } = useAuth();
  const { isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      if (!isLoaded) return;
      
      setIsLoading(true);
      const token = await getToken();
      try {
        const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get-user-profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!profileResponse.ok) throw new Error('Failed to fetch user profile.');
        const profileData: UserProfile = await profileResponse.json();
        setProfile(profileData);

        if (profileData.reddit_profile_status === 'analysis_complete') {
          const tasksResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get-available-tasks`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!tasksResponse.ok) throw new Error('Failed to fetch tasks.');
          const tasksData = await tasksResponse.json();
          setTasks(tasksData);
        }
      } catch (err: any) {
        toast.error(err.message || 'Could not load data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [getToken, isLoaded, router]);

  if (isLoading) {
    return <LoadingState />;
  }

  // --- Conditional Rendering Logic ---

  if (!profile?.reddit_credentials) {
    return (
      <div className="container mx-auto text-center py-20 px-4">
        <h2 className="text-2xl font-bold text-white">Welcome, Executor!</h2>
        <p className="mt-4 text-gray-400">To start accepting tasks and earning, you first need to connect your Reddit account.</p>
        <div className="mt-6">
          <Link href="/settings" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg">
            Go to Settings
          </Link>
        </div>
      </div>
    );
  }

  if (profile.reddit_profile_status === 'pending_analysis') {
    return (
      <div className="container mx-auto text-center py-20 px-4">
        <h2 className="text-2xl font-bold text-white">Analyzing Your Profile...</h2>
        <p className="mt-4 text-gray-400">We are analyzing your Reddit history to determine your Trust Tier. This may take a few minutes. Please refresh the page shortly.</p>
      </div>
    );
  }

  if (profile.reddit_profile_status === 'analysis_failed') {
    return (
      <div className="container mx-auto text-center py-20 px-4">
        <h2 className="text-2xl font-bold text-red-400">Profile Analysis Failed</h2>
        <p className="mt-4 text-gray-400">We couldn't analyze your Reddit profile. The error was:</p>
        <p className="mt-2 text-yellow-300 font-mono bg-gray-900 p-4 rounded-md border border-gray-700">{profile.reddit_profile_error}</p>
        <p className="mt-4 text-gray-400">Please go to settings to correct your username and password. If the problem persists, the account may be suspended or banned.</p>
        <div className="mt-6">
          <Link href="/settings" className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-8 rounded-full">
            Go to Settings
          </Link>
        </div>
      </div>
    );
  }

  // Case 4: Success - Show the marketplace
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Executor Work Queue</h1>
          <p className="text-sm text-gray-400">
            Connected as Reddit user: <span className="font-bold text-orange-400">{profile?.reddit_profile?.username || '...'}</span>
          </p>
        </div>
        
        <div className="text-right bg-gray-800 p-3 rounded-lg border border-gray-700 min-w-[200px]">
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-gray-400">Trust Tier:</span>
            <span className="font-bold text-white text-lg">{profile?.trust_tier || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-baseline mt-1">
            <span className="text-sm text-gray-400">Total Karma:</span>
            <span className="font-bold text-white text-lg">{profile?.reddit_profile?.total_karma || 0}</span>
          </div>
          <div className="flex justify-between items-baseline mt-2">
            <span className="text-sm text-gray-400">Balance:</span>
            <span className="text-2xl font-bold text-green-400">${(profile?.balance_usd ?? 0).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {tasks.length > 0 ? (
          tasks.map(task => <TaskCard key={task.id} task={task} />)
        ) : (
          <div className="text-center bg-gray-800 p-10 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold text-white">The marketplace is empty.</h2>
            <p className="text-gray-400 mt-2">The AI Swarm is generating new tasks. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}