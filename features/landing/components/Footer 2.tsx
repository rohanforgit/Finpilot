"use client";

import { motion } from "framer-motion";
import { fadeVariants } from "@/lib/animations";
import { Globe, Mail, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <motion.footer 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeVariants}
      className="border-t border-white/10 bg-background pt-16 pb-8"
    >
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-heading font-bold text-lg">F</span>
              </div>
              <span className="font-heading font-bold text-xl tracking-tight">FinPilot</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-xs">
              The AI-assisted monthly financial operating system for families and professionals.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
              <MessageCircle className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
              <Globe className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} FinPilot. All rights reserved.</p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
