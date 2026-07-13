"use client";

import { motion } from "framer-motion";
import { slideUpVariants } from "@/lib/animations";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>
      <PageHeader 
        title="Settings" 
        description="Manage your application preferences."
      />

      <motion.div variants={slideUpVariants} className="max-w-2xl mt-8">
        <Card className="p-8 bg-card/40 border-white/10 space-y-8">
          
          <div>
            <h4 className="font-semibold mb-4 text-lg">Appearance</h4>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-muted-foreground">FinPilot currently operates exclusively in Dark Mode for a premium experience.</p>
              </div>
              <Button disabled variant="outline" className="bg-white/10">Active</Button>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-lg">Notifications</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div>
                  <p className="font-medium">AI Insights Alerts</p>
                  <p className="text-sm text-muted-foreground">Receive push notifications when new recommendations are generated.</p>
                </div>
                <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div>
                  <p className="font-medium">Weekly Summary</p>
                  <p className="text-sm text-muted-foreground">Receive a weekly email summarizing your spending.</p>
                </div>
                <div className="w-12 h-6 bg-white/20 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </div>
          
        </Card>
      </motion.div>
    </motion.div>
  );
}
