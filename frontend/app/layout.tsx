import type { Metadata } from "next";
import localFont from 'next/font/local';
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from '@clerk/themes';
import "./globals.css";

/*const inter = localFont({
  src: './fonts/Inter-VariableFont_opsz,wght.ttf',
  display: 'swap',
  variable: '--font-inter',
})*/

export const metadata: Metadata = {
  title: "AgentSaaS v3",
  description: "The AI-Powered, Human-Executed Engagement Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }} waitlistUrl="/">
      <html lang="en" className="h-full">
        <body className=/*{`${inter.variable}*/
         {`h-full bg-gray-900 text-gray-100 font-sans`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}