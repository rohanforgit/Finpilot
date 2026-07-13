"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
      >
        <Plus className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-45' : ''}`} />
      </motion.button>
    </div>
  );
}
