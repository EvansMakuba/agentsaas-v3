// sidehustles\hustle4\frontend\app\dashboard\brand\[campaignId]\page.tsx
'use client';

import { useParams } from 'next/navigation';

// This is a placeholder for our new Campaign Detail Page.
// It will eventually have tabs for Approval, Knowledge Base, and Logs.
export default function CampaignDetailPage() {
  // The useParams hook from Next.js gives us access to the dynamic part of the URL.
  // In this case, it will be the ID of the campaign from Firestore.
  const params = useParams();
  const { campaignId } = params;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white">Campaign Details</h1>
      <p className="text-gray-400 mt-2">
        You are viewing the command center for campaign ID: 
        <span className="font-mono text-orange-400 ml-2">{campaignId}</span>
      </p>

      <div className="mt-8">
        {/* We will build out the tabbed interface here in the next steps */}
        <p className="text-gray-500">Approval Center and other features will be built here.</p>
      </div>
    </div>
  );
}