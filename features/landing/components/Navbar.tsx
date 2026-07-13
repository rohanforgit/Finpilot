"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { fadeVariants } from "@/lib/animations";

import Link from "next/link";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent ${
        scrolled
          ? "bg-background/70 backdrop-blur-md border-border shadow-sm"
          : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-heading font-bold text-lg">F</span>
          </div>
          <span className="font-heading font-bold text-xl tracking-tight">FinPilot</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
          <a href="#demo" className="hover:text-foreground transition-colors">Technology</a>
          <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button className="rounded-full px-6 font-semibold shadow-lg shadow-primary/20">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
