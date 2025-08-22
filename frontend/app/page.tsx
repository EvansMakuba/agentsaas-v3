import { SignUpButton } from "@clerk/nextjs";
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

// This is the public-facing landing page for signed-out users.
export default function HomePage() {
  return (
    <div className="bg-gradient-to-b from-gray-900 to-slate-800">
      {/* We add a simple header for signed-out users right here */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
          <div className="text-2xl font-bold text-white">AgentSaaS v3</div>
          <div>
            <Link href="/dashboard" className="text-white font-semibold">Log In</Link>
          </div>
        </nav>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="min-h-screen flex flex-col justify-center items-center text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white">
            AI Strategy Meets <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Human Execution
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg md:text-xl text-gray-300">
            The ultimate platform for brands to deploy intelligent agent campaigns,
            powered by a network of skilled human executors.
          </p>
          <div className="mt-10">
            <SignUpButton mode="modal">
              <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full text-lg transition-transform transform hover:scale-105">
                <span>Join Now</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </SignUpButton>
          </div>
        </div>
      </div>
    </div>
  );
}