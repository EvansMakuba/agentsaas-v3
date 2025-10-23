'use client';

import { SignUpButton, Waitlist } from '@clerk/nextjs';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
 // <-- Adjust path as needed

export default function HomePage() {
  return (
    <div className="bg-gradient-to-b from-gray-900 to-slate-800 text-white min-h-screen flex flex-col">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-transparent backdrop-blur-md">
        <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
          <div className="text-2xl font-bold">AgentSaaS</div>
          <div className="space-x-4">
            <Link
              href="/dashboard"
              className="text-white hover:text-blue-400 font-medium transition"
            >
              Log In
            </Link>
            <SignUpButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-full transition">
                Join Waitlist
              </button>
            </SignUpButton>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center">
        <div className="text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
            AI Strategy Meets
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Human Execution
            </span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-300">
            Join our early access waitlist and be the first to scale authentic Reddit engagement using AI agents trained by real humans.
          </p>

          {/* Call to Actions */}
          <div className="mt-10 flex justify-center gap-4 flex-wrap">
            <SignUpButton mode="modal">
              <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full text-lg transition-transform transform hover:scale-105">
                <span>Join Waitlist</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </SignUpButton>
            <Link href="#how-it-works">
              <button className="text-white border border-gray-500 hover:border-white py-3 px-6 rounded-full text-lg transition hover:scale-105">
                Learn More
              </button>
            </Link>
          </div>
        </div>

        {/* 📝 Render your custom Waitlist component here */}
        <div className="mt-20 w-full px-4 sm:px-6 lg:px-8">
          <Waitlist />
        </div>
      </main>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-slate-900 py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">How AgentSaaS Works</h2>
          <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto">
            Whether you are a solo developer or a fast-growing brand, AgentSaaS empowers you to scale authentic engagement across Reddit and beyond — powered by AI, driven by humans.
          </p>

          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="p-6 border border-gray-700 rounded-lg bg-gray-800/50">
              <h3 className="text-2xl font-semibold mb-2">👨‍💻 For Individuals</h3>
              <p className="text-gray-300">
                Get a personal AI co-pilot that finds high-value Reddit threads,
                drafts replies in your voice, and helps you grow your reputation — all with one-click approval.
              </p>
            </div>
            <div className="p-6 border border-gray-700 rounded-lg bg-gray-800/50">
              <h3 className="text-2xl font-semibold mb-2">🏢 For Businesses</h3>
              <p className="text-gray-300">
                Gain deep market insights and run intelligent engagement campaigns.
                Our swarm of agents ensures authentic, value-adding interactions — not spammy posts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm py-6">
        © {new Date().getFullYear()} AgentSaaS. All rights reserved.
      </footer>
    </div>
  );
}
