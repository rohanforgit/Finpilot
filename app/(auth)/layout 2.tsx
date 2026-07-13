"use client";

import { motion } from "framer-motion";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex bg-background selection:bg-primary/20">
      {/* Left Panel: Desktop Animated Gradient */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-background border-r border-white/10 items-center justify-center p-12">
        <div className="absolute inset-0 bg-background z-10" />
        {/* Animated Mesh Blobs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute w-[500px] h-[500px] bg-primary/30 rounded-full blur-[100px] -top-32 -left-32 z-20"
        />
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            rotate: [0, -90, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] bottom-10 -right-20 z-20"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[90px] top-1/2 left-1/4 z-20"
        />

        {/* Foreground Content */}
        <div className="relative z-30 max-w-md text-left">
          <h2 className="text-4xl font-heading font-bold mb-6 tracking-tight leading-tight">
            Financial clarity, <br /> designed for you.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Join thousands of planners who have automated their financial organization and reclaimed their peace of mind.
          </p>
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
            <p className="text-sm text-foreground/80 italic mb-4">
              "FinPilot replaced my chaotic Excel sheets entirely. The AI insights alone have paid for the service."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">EK</span>
              </div>
              <div className="text-xs">
                <p className="font-semibold text-foreground">Elena K.</p>
                <p className="text-muted-foreground">Product Manager</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-sm"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
