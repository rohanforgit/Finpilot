"use client";

import React from "react";
import { HeroSection } from "@/components/ui/galaxy-interactive-hero-section";
import { ShieldCheck, Sparkles, Landmark, Coins, FileText, ChevronRight } from "lucide-react";
import Link from "next/link";

const MARKETING_FEATURES = [
  {
    icon: Landmark,
    title: "True Net Worth HUD",
    description: "Compile and audit bank balances, stock indexes, fixed deposits, and property holdings side-by-side with EMIs."
  },
  {
    icon: FileText,
    title: "Gemini Receipt OCR",
    description: "Drag mobile payment screenshots (PhonePe, Paytm, GPay) and let Gemini Vision instantly map merchants, categories, and totals."
  },
  {
    icon: Sparkles,
    title: "AI Financial Coach",
    description: "Receive natural language advisory on budgeting anomalies, high interest APR liabilities warning, and goal completion milestones."
  }
];

export default function LandingPage() {
  return (
    <main className="bg-black min-h-screen text-white relative">
      {/* Interactive Hero Banner (renders spline and screenshot animations) */}
      <HeroSection />

      {/* Product features display */}
      <section className="bg-black py-20 relative z-10 border-t border-border/20">
        <div className="container mx-auto px-6 max-w-5xl space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-extrabold font-display tracking-tight text-white">
              Wealth intelligence, simplified.
            </h2>
            <p className="text-gray-400 text-sm max-w-lg mx-auto leading-relaxed">
              Traditional banking applications show logs of statements. FinPilot AI models your future cash flows, debt curves, and milestones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {MARKETING_FEATURES.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#111113] border border-border/40 p-6.5 rounded-xl space-y-4 hover:border-accent/40 transition-all duration-300 group"
                >
                  <div className="h-10 w-10 rounded-lg bg-black/40 border border-border/30 flex items-center justify-center text-accent group-hover:bg-accent/15 transition duration-300">
                    <Icon className="h-5.5 w-5.5" />
                  </div>
                  <h3 className="text-base font-bold text-white tracking-wide">{feature.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>

          {/* CTA Banner */}
          <div className="bg-[#111113] border border-border/40 p-8 rounded-2xl text-center space-y-6 max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
            <div className="space-y-2">
              <h3 className="text-xl font-bold font-display text-white">Establish your personal cash command center today</h3>
              <p className="text-gray-400 text-xs">Instantly scan receipts, optimize savings rates, and chat with your Coach.</p>
            </div>
            <div className="flex justify-center">
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-6 py-3 bg-accent text-[#09090b] hover:bg-accent/80 font-extrabold rounded-full text-sm transition duration-300 shadow-lg shadow-accent/15"
              >
                Launch FinPilot Platform <ChevronRight className="h-4.5 w-4.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/80 border-t border-border/10 py-10 text-center text-xs text-gray-600 font-medium">
        © 2026 FinPilot AI, Inc. All rights reserved. Operating under luxury financial telemetry constraints.
      </footer>
    </main>
  );
}
