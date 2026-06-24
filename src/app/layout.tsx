import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinPilot AI | Your Personal Financial Operating System",
  description:
    "Take command of your financial intelligence. Track your true net worth, model cash flow projections, automate expense scans using Gemini Vision, schedule upcoming bills, and receive deep insights from your dedicated AI Coach.",
  keywords: ["personal finance", "net worth", "AI budget planner", "expense tracker OCR", "fintech command center", "cash flow forecast"],
  authors: [{ name: "FinPilot AI Team" }],
  openGraph: {
    title: "FinPilot AI | Your Personal Financial Operating System",
    description: "Take command of your financial intelligence. Track net worth, forecast cash flows, scan receipts with Vision, and chat with your AI Coach.",
    url: "https://finpilot.ai",
    siteName: "FinPilot AI",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full bg-background text-foreground flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
