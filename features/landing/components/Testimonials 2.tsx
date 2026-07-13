"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { slideUpVariants, fadeVariants } from "@/lib/animations";

const testimonials = [
  {
    quote: "FinPilot finally helped me understand where my money goes without forcing me to track every single transaction manually. The OCR feature is magic.",
    author: "Rahul S.",
    role: "Software Engineer",
  },
  {
    quote: "I used to maintain a complex Excel sheet for our family budget. FinPilot replaced it completely. The AI recommendations have saved us thousands.",
    author: "Priya & Arun",
    role: "Working Parents",
  },
  {
    quote: "The interface is so calm and minimal. Unlike other finance apps, it doesn't make me anxious to open it. It's truly a premium experience.",
    author: "Siddharth K.",
    role: "Product Designer",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-6">
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
            Loved by Planners
          </motion.h2>
          <motion.p variants={fadeVariants} className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See what others are saying about their experience with FinPilot.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={slideUpVariants}
              transition={{ delay: i * 0.15 }}
            >
              <Card className="p-8 h-full bg-white/5 border-white/10 flex flex-col justify-between group hover:bg-white/10 transition-colors">
                <p className="text-muted-foreground leading-relaxed mb-8 italic">
                  "{testimonial.quote}"
                </p>
                <div>
                  <h4 className="font-semibold text-foreground">{testimonial.author}</h4>
                  <p className="text-sm text-primary">{testimonial.role}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
