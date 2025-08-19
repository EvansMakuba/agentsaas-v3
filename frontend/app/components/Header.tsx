import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

const Header = () => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 border-b border-gray-700">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        {/* ... Logo and Desktop Navigation Links remain the same ... */}
        <Link href="/" className="text-2xl font-bold text-white">
          AgentSaaS v3
        </Link>
        <div className="hidden md:flex items-center space-x-8">
          <Link href="#features" className="text-gray-300 hover:text-white transition-colors">Features</Link>
          <Link href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</Link>
          <Link href="#contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-4">
          <SignedIn>
            {/* REMOVE the afterSignOutUrl prop from this component */}
            <UserButton /> 
          </SignedIn>
          <SignedOut>
            {/* ... SignInButton and SignUpButton remain the same ... */}
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