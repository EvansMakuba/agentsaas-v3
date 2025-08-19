import { SignUpButton } from "@clerk/nextjs";
import { ArrowRight } from 'lucide-react'; // A popular icon library, let's install it

export default function HomePage() {
  return (
    // We add a subtle background gradient to make it less flat
    <div className="bg-gradient-to-b from-gray-900 to-slate-800">
      {/* Main container for the hero section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="min-h-screen flex flex-col justify-center items-center text-center">
          
          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white">
            AI Strategy Meets <br />
            <span className="bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Human Execution
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="mt-6 max-w-2xl text-lg md:text-xl text-gray-300">
            The ultimate platform for brands to deploy intelligent agent campaigns,
            powered by a network of skilled human executors.
          </p>

          {/* Call-to-Action Button */}
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