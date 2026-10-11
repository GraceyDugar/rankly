import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: `${site.name} — AI Visibility Tracker for AI Search, AEO & GEO`,
  description: `AI visibility tracker for AI search. Weekly AI SEO report (AEO & GEO): see if AI recommends your business, who it names instead, and 3 fixes. $${site.price}/month.`,
  keywords: [
    "AI visibility tracker",
    "AI search",
    "AEO & GEO",
    "AI SEO",
    "AI search visibility",
    "AEO tool",
    "answer engine optimization",
    "GEO tool",
    "generative engine optimization",
    "AI SEO",
    "ChatGPT SEO",
    "rank in ChatGPT",
    "get recommended by ChatGPT",
    "Gemini SEO",
    "Perplexity SEO",
    "LLM visibility",
    "AI brand monitoring",
    "AI search ranking",
    "Google Gemini",
    "Gemini SEO",
    "rank in Google's AI",
  ],
  openGraph: {
    title: `${site.name} — AI visibility tracker: does AI search recommend you?`,
    description: `Weekly AI visibility report for $${site.price}/month. See who AI recommends and how to get on the list.`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Does AI recommend you?`,
    description: `Weekly AI visibility report for $${site.price}/month.`,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
