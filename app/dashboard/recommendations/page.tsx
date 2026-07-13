"use client";

import { motion } from "framer-motion";
import { slideUpVariants } from "@/lib/animations";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { mockRecommendations } from "@/lib/mockData";
import { BrainCircuit, AlertTriangle, TrendingUp, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RecommendationsPage() {
  const getIcon = (type: string) => {
    switch(type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'alert': return <Info className="w-5 h-5 text-blue-500" />;
      case 'insight': default: return <TrendingUp className="w-5 h-5 text-emerald-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch(type) {
      case 'warning': return 'bg-amber-500/10 border-amber-500/20';
      case 'alert': return 'bg-blue-500/10 border-blue-500/20';
      case 'insight': default: return 'bg-emerald-500/10 border-emerald-500/20';
    }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>
      <PageHeader 
        title="AI Insights" 
        description="Smart, contextual recommendations based on your spending behavior."
      />

      <div className="max-w-3xl mt-8 space-y-6">
        <div className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/20 rounded-xl mb-8 backdrop-blur-sm">
          <BrainCircuit className="w-6 h-6 text-primary" />
          <p className="text-sm font-medium text-primary">Intelligence Engine is actively monitoring your budget allocation.</p>
        </div>

        {mockRecommendations.map((rec, i) => (
          <motion.div key={rec.id} variants={slideUpVariants} custom={i}>
            <Card className="p-6 bg-card/40 border-white/10 hover:bg-white/5 transition-colors relative overflow-hidden">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center border ${getBgColor(rec.type)}`}>
                  {getIcon(rec.type)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{rec.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {rec.description}
                  </p>
                  <Button variant="outline" size="sm" className="bg-white/5 border-white/10">
                    {rec.action}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
