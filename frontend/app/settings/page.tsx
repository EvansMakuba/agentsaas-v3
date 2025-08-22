'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';

import { useRouter } from 'next/navigation'; // <-- Add this import

// =====================================================================================
// RedditCredsForm Component - The UI for submitting credentials
// =====================================================================================
const RedditCredsForm = () => {
  // State is now simplified to just username and password
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { getToken } = useAuth();

  const router = useRouter(); // <-- Initialize the router

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const loadingToast = toast.loading('Saving credentials...');

    try {
      const token = await getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/save-reddit-credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        // The body now sends the simple username/password payload
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        // Display the specific error message from our backend validation
        throw new Error(data.error || 'Failed to save credentials.');
      }
      
      toast.success(
        (t) => (
          <div className="flex flex-col items-center gap-2">
            <span>Credentials saved! Profile analysis has begun.</span>
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded-md text-sm"
              onClick={() => {
                router.push('/dashboard');
                toast.dismiss(t.id);
              }}
            >
              Go to Dashboard
            </button>
          </div>
        ),
        { id: loadingToast, duration: 6000 } // Keep the toast open longer
      );
      // Clear the form on success
      setUsername('');
      setPassword('');
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-white">Connect Your Reddit Account</h2>
      <p className="text-gray-400 mb-4">
        Provide your Reddit username and password. Your password will be encrypted and is used to automate actions in the future.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-300">Reddit Username</label>
          <input 
            id="username" 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            placeholder="e.g., Reasonable_Panda8978" 
            className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md p-2 text-white focus:ring-blue-500 focus:border-blue-500" 
            required 
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300">Reddit Password</label>
          <input 
            id="password" 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md p-2 text-white focus:ring-blue-500 focus:border-blue-500" 
            required 
          />
        </div>
        <button 
          type="submit" 
          disabled={isLoading} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50"
        >
          {isLoading ? 'Saving & Analyzing...' : 'Save & Analyze Profile'}
        </button>
      </form>
    </div>
  );
};

// =====================================================================================
// Main SettingsPage Component
// =====================================================================================
export default function SettingsPage() {
  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>
      <RedditCredsForm />
      {/* We can add other settings components here in the future */}
    </div>
  );
}