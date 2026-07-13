"use client";

import { motion } from "framer-motion";
import { slideUpVariants, fadeVariants } from "@/lib/animations";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Do I need to link my bank account?",
    answer: "No. FinPilot is designed with privacy in mind. We use OCR technology to read your payment screenshots instead of requiring direct bank access.",
  },
  {
    question: "How does the AI categorization work?",
    answer: "When you upload a screenshot, our Intelligence Engine extracts the merchant name and amount. It then predicts the category based on your past habits and general data.",
  },
  {
    question: "Will the AI move my money automatically?",
    answer: "Never. The AI acts strictly as an advisor. It will provide actionable recommendations, but every financial decision requires your explicit approval.",
  },
  {
    question: "Is my financial data secure?",
    answer: "Yes. All your data is encrypted, and we do not store your payment screenshots permanently unless you explicitly enable history tracking.",
  },
  {
    question: "Can I use FinPilot for business accounting?",
    answer: "FinPilot is optimized for salaried individuals and families managing household finances. It is not designed for GST tracking, invoicing, or enterprise accounting.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-24 relative overflow-hidden bg-white/[0.02]">
      <div className="max-w-[800px] mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
          className="text-center mb-16"
        >
          <motion.h2 variants={slideUpVariants} className="text-3xl md:text-5xl font-heading font-bold mb-4">
            Frequently Asked Questions
          </motion.h2>
          <motion.p variants={fadeVariants} className="text-muted-foreground text-lg">
            Everything you need to know about FinPilot.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Accordion className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-white/10">
                <AccordionTrigger className="text-left text-lg hover:text-primary transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
