'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';

export default function BrandDashboard() {
  // State variables to hold the form input values
  const [objective, setObjective] = useState('');
  const [budget, setBudget] = useState('');
  const [targetSubreddits, setTargetSubreddits] = useState('');
  
  // State for handling the API call
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { getToken } = useAuth();

  // This function is triggered when the form is submitted
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the default browser form submission
    setIsLoading(true);
    setError('');

    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:5000/api/create-campaign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          objective,
          budget: parseFloat(budget),
          // Split the comma-separated string of subreddits into an array
          targetSubreddits: targetSubreddits.split(',').map(s => s.trim()),
        }),
      });


      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create campaign.');
      }
      
      // If the backend returns a payment_url, redirect the user's browser to IntaSend
      if (data.payment_url) {
        window.location.href = data.payment_url;
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Brand Command Center</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side: Create Campaign Form */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-white">Launch a New Campaign</h2>
          <form onSubmit={handleCreateCampaign} className="space-y-4">
            <div>
              <label htmlFor="objective" className="block text-sm font-medium text-gray-300 mb-1">
                Campaign Objective
              </label>
              <textarea
                id="objective"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="e.g., Promote our new AI productivity tool in tech-focused communities."
                className="w-full h-24 bg-gray-900 border border-gray-600 rounded-md p-2 text-white"
                required
              />
            </div>
            <div>
              <label htmlFor="subreddits" className="block text-sm font-medium text-gray-300 mb-1">
                Target Subreddits (comma-separated)
              </label>
              <input
                id="subreddits"
                type="text"
                value={targetSubreddits}
                onChange={(e) => setTargetSubreddits(e.target.value)}
                placeholder="e.g., r/programming, r/technology"
                className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white"
                required
              />
            </div>
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-300 mb-1">
                Budget (KES)
              </label>
              <input
                id="budget"
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g., 5000"
                className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-white"
                required
                min="1000" // Set a minimum budget
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Proceed to Payment'}
            </button>
            {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
          </form>
        </div>

        {/* Right Side: Active Campaigns List (This is just a placeholder for now) */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-white">Your Active Campaigns</h2>
          <div className="text-center text-gray-400 p-8">
            <p>Your active campaigns will appear here once they are funded.</p>
          </div>
        </div>
      </div>
    </div>
  );
}