import type { Metadata } from "next";
import { DynaPuff, Sour_Gummy, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import PageLoader from "@/components/shadn/PageLoader";

const dynaPuff = DynaPuff({
  variable: "--font-dynapuff",
  subsets: ["latin"],
});

const sourGummy = Sour_Gummy({
  variable: "--font-sour-gummy",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CMS Dashboard",
  description:
    "A simple CMS built with Next.js and Supabase for managing content, events, testimonials, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dynaPuff.variable} ${sourGummy.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <PageLoader />
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
