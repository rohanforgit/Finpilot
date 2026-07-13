"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
}

export function AnimatedCounter({ value, prefix = "", suffix = "" }: AnimatedCounterProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const spring = useSpring(0, { mass: 1, stiffness: 50, damping: 15 });
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString());

  useEffect(() => {
    setHasMounted(true);
    spring.set(value);
  }, [value, spring]);

  if (!hasMounted) {
    return <span>{prefix}{value.toLocaleString()}{suffix}</span>;
  }

  return (
    <span className="font-mono inline-flex">
      {prefix}
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  );
}
