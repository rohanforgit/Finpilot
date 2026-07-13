import { ReactNode } from "react";
import { motion } from "framer-motion";
import { fadeVariants } from "@/lib/animations";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center text-center p-12 bg-card rounded-2xl border border-border"
    >
      {icon && <div className="text-muted-foreground mb-4">{icon}</div>}
      <h3 className="text-xl font-heading font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
      {action && <div>{action}</div>}
    </motion.div>
  );
}
