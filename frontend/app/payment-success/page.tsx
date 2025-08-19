'use client';

import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
  return (
    <div className="container mx-auto flex flex-col justify-center items-center min-h-screen text-center">
      <CheckCircle className="h-24 w-24 text-green-500 mb-6" />
      <h1 className="text-4xl font-bold text-white">Payment Successful!</h1>
      <p className="mt-4 text-lg text-gray-400">
        Your campaign has been funded and is now active.
      </p>
      <p className="text-gray-400">
        Our AI Swarm will begin generating tasks for the marketplace shortly.
      </p>
      <div className="mt-10">
        <Link 
          href="/dashboard"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}