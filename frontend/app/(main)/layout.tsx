
import Header from "@/app/components/Header"; // Using the '@' alias for cleaner imports
import { Toaster } from "react-hot-toast";

// This layout will wrap all our authenticated pages (dashboard, settings, etc.)
export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-center" />
      <Header />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}