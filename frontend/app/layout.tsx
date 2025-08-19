import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from '@clerk/themes';
import Header from "./components/Header"; // We need our Header component
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AgentSaaS v3",
  description: "The AI-Powered, Human-Executed Engagement Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en" className="h-full">
        {/* We restore the dark background and default text color to the body */}
        <body className={`${inter.className} h-full bg-gray-900 text-gray-100`}>
          {/* This flexbox structure ensures the header is at the top and the main content fills the rest of the space */}
          <div className="min-h-screen flex flex-col">
            {/* 
              THIS IS THE CRITICAL LINE THAT WAS MISSING.
              We are adding our Header component back in.
            */}
            <Header />

            {/* The main content area that will grow to fill the available space */}
            <main className="flex-grow">
              {children}
            </main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}