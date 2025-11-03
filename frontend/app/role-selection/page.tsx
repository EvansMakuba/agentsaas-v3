'use client'; // This component needs to be a client component to use state and hooks.

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation'; // Import the router hook

export default function RoleSelectionPage() {
  // State to track which role the user has selected
  const [selectedRole, setSelectedRole] = useState<'brand' | 'executor' | null>(null);
  // State to handle loading and disable the button during API calls
  const [isLoading, setIsLoading] = useState(false);
  // State to display any errors from the backend
  const [error, setError] = useState('');

  const { getToken } = useAuth(); // Hook to get the user's authentication token
  const router = useRouter(); // Hook to programmatically redirect the user

  // This function will be called when the user clicks the "Confirm" button
  const handleRoleSelection = async () => {
    if (!selectedRole) {
      setError('Please select a role to continue.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      // Get the JWT from Clerk to authenticate our request to the backend
      const token = await getToken();

      // Make a POST request to our future backend endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/set-user-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // The Authorization header is how our backend will verify the user
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: selectedRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If the backend returns an error, display it
        throw new Error(data.error || 'Something went wrong.');
      }
      
      // If the role was set successfully, redirect the user to their dashboard
      router.push('/dashboard');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      // Re-enable the button whether the request succeeded or failed
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl flex flex-col justify-center items-center min-h-screen text-center">
      <h1 className="text-4xl font-bold text-white">One Last Step: Choose Your Path</h1>
      <p className="mt-4 text-lg text-gray-400">
        This choice is permanent and will tailor your experience on the platform. How will you be using AgentSaaS?
      </p>

      {/* Role selection cards */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {/* Brand Card */}
        <div
          onClick={() => setSelectedRole('brand')}
          className={`p-8 border-2 rounded-lg cursor-pointer transition-all ${
            selectedRole === 'brand' ? 'border-blue-500 bg-blue-900/30' : 'border-gray-700 hover:border-blue-600'
          }`}
        >
          <h2 className="text-2xl font-bold mb-2 text-white">Im a Brand</h2>
          <p className="text-gray-400">I want to launch AI-powered campaigns to grow my presence.</p>
        </div>

        {/* Executor Card */}
        <div
          onClick={() => setSelectedRole('executor')}
          className={`p-8 border-2 rounded-lg cursor-pointer transition-all ${
            selectedRole === 'executor' ? 'border-green-500 bg-green-900/30' : 'border-gray-700 hover:border-green-600'
          }`}
        >
          <h2 className="text-2xl font-bold mb-2 text-white">Im an Executor</h2>
          <p className="text-gray-400">I want to complete engagement tasks and earn money.</p>
        </div>
      </div>

      {/* Confirmation Button */}
      <div className="mt-12">
        <button
          onClick={handleRoleSelection}
          disabled={!selectedRole || isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-12 rounded-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Confirm and Enter'}
        </button>
        {error && <p className="text-red-400 mt-4">{error}</p>}
      </div>
    </div>
  );
}