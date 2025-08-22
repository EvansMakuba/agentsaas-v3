import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

const Header = () => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm sticky top-0 left-0 right-0 z-50 border-b border-gray-700">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-white">
          AgentSaaS v3
        </Link>

        {/* --- THIS IS THE UPDATED SECTION --- */}
        
        {/* Navigation for Signed-OUT Users */}
        <SignedOut>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-300 hover:text-white transition-colors">Features</Link>
            <Link href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</Link>
            <Link href="#contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link>
          </div>
        </SignedOut>

        {/* Navigation for Signed-IN Users */}
        <SignedIn>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link>
            {/* This is the new link to the settings page we just created */}
            <Link href="/settings" className="text-gray-300 hover:text-white transition-colors">Settings</Link>
          </div>
        </SignedIn>

        {/* Auth Buttons Section */}
        <div className="flex items-center space-x-4">
          <SignedIn>
            {/* The UserButton is now just for profile and sign-out actions */}
            <UserButton /> 
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-gray-300 hover:text-white transition-colors">
                Log In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
                Sign Up
              </button>
            </SignUpButton>
          </SignedOut>
        </div>
      </nav>
    </header>
  );
};

export default Header;