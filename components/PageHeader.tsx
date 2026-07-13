"use client";

import { motion } from "framer-motion";
import { slideUpVariants } from "@/lib/animations";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <motion.div variants={slideUpVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
      <div>
        <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight mb-2">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {actions && (
        <div className="flex-shrink-0">
          {actions}
        </div>
      )}
    </motion.div>
  );
}
