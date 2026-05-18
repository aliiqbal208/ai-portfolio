import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Load Inter font for non-Apple devices
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Muhammad Ali – AI Portfolio",
  description: "Interactive portfolio with an AI-powered Memoji that answers questions about me, my skills, and my experience",
  keywords: [
    // Identity & role
    "Muhammad Ali",
    "Senior Software Engineer",
    "Lead Full Stack Developer",
    // Web & frontend
    "Interactive Portfolio",
    "Web Development",
    "Frontend",
    "React",
    "Next.js",
    "Angular",
    "TypeScript",
    "JavaScript",
    // Backend & systems
    "Backend",
    "Node.js",
    "Express",
    "Fastify",
    "Golang",
    "Go Fiber",
    "Python",
    "Flask",
    "FastAPI",
    // AI & Data
    "AI",
    "LLM",
    "OpenAI",
    "Hugging Face",
    "RAG",
    "Embeddings",
    "Chatbots",
    "Semantic Search",
    "Speech Processing",
    "Automation",
    "AI Agents",
    "Prompt Engineering",
    "Vector Database",
    // Cloud & infra
    "AWS",
    "GCP",
    "Docker",
    "Redis",
    "Kafka",
    "GitHub Actions",
    // Databases
    "MongoDB",
    "PostgreSQL",
    // Architecture
    "Microservices",
    "Serverless",
    "Event-driven",
    "WebSockets",
    "Pub/Sub",
    // Observability
    "Prometheus",
    "Grafana",
    "ELK Stack",
    "Splunk",
    "Datadog",
    "Sentry",
  ],
  authors: [
    {
      name: "Muhammad Ali",
      url: "https://themuhammadali.dev/",
    },
  ],
  creator: "Muhammad Ali",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://themuhammadali.dev/",
    title: "Muhammad Ali – AI Portfolio",
    description: "Interactive portfolio with an AI-powered Memoji that answers questions about me",
    siteName: "Muhammad Ali – AI Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Muhammad Ali – AI Portfolio",
    description: "Interactive portfolio with an AI-powered Memoji that answers questions about me",
    creator: "@aliiqbal208",
  },
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        sizes: "any",
      }
    ],
    shortcut: "/favicon.svg?v=2",
    apple: "/apple-touch-icon.svg?v=2",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" href="/favicon.svg" sizes="any" />
              <meta name="color-scheme" content="light dark" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
        >
          <main className="flex min-h-screen flex-col">
            {children}
          </main>
          <Toaster />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}