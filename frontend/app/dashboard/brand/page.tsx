// sidehustles\hustle4\frontend\app\dashboard\brand\page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';

// Define a TypeScript interface for our Campaign data for type safety
interface Campaign {
  id: string;
  objective: string;
  budget_usd: number;
  status: string;
  target_subreddits: string[];
  created_at: string;
}

// A new, reusable component to display a single campaign card
const CampaignCard = ({ campaign }: { campaign: Campaign }) => (
  <div className="bg-gray-700 p-4 rounded-lg shadow-md border border-gray-600">
    <h3 className="font-bold text-lg text-white truncate">{campaign.objective}</h3>
    <div className="mt-2 flex justify-between items-baseline">
      <p className={`text-sm font-semibold ${campaign.status === 'active' ? 'text-green-400' : 'text-yellow-400'}`}>
        Status: <span className="capitalize">{campaign.status}</span>
      </p>
      <p className="text-lg font-bold text-white">${campaign.budget_usd.toFixed(2)}</p>
    </div>
    <p className="text-xs text-gray-400 mt-3 truncate">
      Subreddits: {campaign.target_subreddits.join(', ')}
    </p>
    <p className="text-xs text-gray-500 mt-1">
      Created: {new Date(campaign.created_at).toLocaleDateString()}
    </p>
  </div>
);

export default function BrandDashboard() {
  // State for the list of campaigns
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);
  
  // State for the "Launch a New Campaign" form
  const [objective, setObjective] = useState('');
  const [budget, setBudget] = useState('');
  const [targetSubreddits, setTargetSubreddits] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const { getToken } = useAuth();

  // This function fetches the user's campaigns from our new backend endpoint
  const fetchCampaigns = async () => {
    setIsLoadingCampaigns(true);
    const token = await getToken();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get-my-campaigns`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch your campaigns.');
      const data = await response.json();
      setCampaigns(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoadingCampaigns(false);
    }
  };

  // This useEffect hook calls fetchCampaigns() when the component first loads
  useEffect(() => {
    fetchCampaigns();
  }, []);

  // The form submission logic remains the same
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    const loadingToast = toast.loading('Creating your campaign...');
    try {
      const token = await getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/create-campaign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          objective,
          budget: parseFloat(budget),
          targetSubreddits: targetSubreddits.split(',').map(s => s.trim().replace(/^r\//, '')), // Clean up subreddits
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create campaign.');
      
      toast.success('Redirecting to payment...', { id: loadingToast });
      if (data.payment_url) window.location.href = data.payment_url;

    } catch (err: any) {
      toast.error(err.message, { id: loadingToast });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Brand Command Center</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Launch Campaign Form */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-white">Launch a New Campaign</h2>
          <form onSubmit={handleCreateCampaign} className="space-y-4">
            {/* Form fields are the same */}
            <div>
              <label htmlFor="objective" className="block text-sm font-medium text-gray-300 mb-1">Campaign Objective</label>
              <textarea id="objective" value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="e.g., Promote our new AI productivity tool..." className="w-full h-24 bg-gray-900 border-gray-600 rounded-md p-2 text-white" required />
            </div>
            <div>
              <label htmlFor="subreddits" className="block text-sm font-medium text-gray-300 mb-1">Target Subreddits (comma-separated)</label>
              <input id="subreddits" type="text" value={targetSubreddits} onChange={(e) => setTargetSubreddits(e.target.value)} placeholder="e.g., programming, technology" className="w-full bg-gray-900 border-gray-600 rounded-md p-2 text-white" required />
            </div>
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-300 mb-1">Budget (KES)</label>
              <input id="budget" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g., 5000" className="w-full bg-gray-900 border-gray-600 rounded-md p-2 text-white" required min="1000" />
            </div>
            <button type="submit" disabled={isCreating} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50">
              {isCreating ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </form>
        </div>

        {/* Active Campaigns List (NOW DYNAMIC) */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-bold mb-4 text-white">Your Active Campaigns</h2>
          {isLoadingCampaigns ? (
            <p className="text-gray-400">Loading your campaigns...</p>
          ) : campaigns.length > 0 ? (
            // we'll use a grid for a nice layout.
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaigns.map(campaign => <CampaignCard key={campaign.id} campaign={campaign} />)}
            </div>
          ) : (
            <p className="text-gray-400">You have no active campaigns. Launch one to get started!</p>
          )}
        </div>
      </div>
    </div>
  );
}