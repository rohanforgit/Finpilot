import { motion } from 'framer-motion';
import { fadeVariants } from '@/lib/animations';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <motion.main
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      className={`max-w-[1280px] mx-auto px-4 md:px-8 py-8 ${className}`}
    >
      {children}
    </motion.main>
  );
}
