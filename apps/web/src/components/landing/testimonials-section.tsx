"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Product Manager at Stripe",
    content:
      "LifeOS AI replaced 5 different apps for me. The AI planner alone saves me an hour every day. It genuinely understands how I work.",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "Freelance Designer",
    content:
      "The habit tracking with AI insights is incredible. I finally broke my procrastination pattern after the AI showed me my avoidance triggers.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Startup Founder",
    content:
      "As a founder, my life IS my work. LifeOS AI helps me maintain boundaries while staying productive. The daily AI reports are a game-changer.",
    rating: 5,
  },
  {
    name: "David Park",
    role: "Software Engineer at Google",
    content:
      "The code quality of this app is amazing — fast, reliable, beautiful. And the AI search finds anything I need in milliseconds across all my data.",
    rating: 5,
  },
  {
    name: "Lisa Thompson",
    role: "Health & Wellness Coach",
    content:
      "I recommend LifeOS AI to all my clients. The health tracking combined with habit analytics gives them visibility they never had before.",
    rating: 5,
  },
  {
    name: "James Wright",
    role: "MBA Student at Wharton",
    content:
      "Goal tracking with milestones + AI coaching helped me achieve more in 3 months than the entire previous year. The analytics show me exactly where I stand.",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="px-4 py-24 lg:py-32 bg-muted/30">
      <div className="container mx-auto">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
          >
            Loved by{" "}
            <span className="gradient-text">thousands</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-muted-foreground"
          >
            Join people who have transformed how they organize their lives.
          </motion.p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl border bg-card p-6 transition-all duration-200 hover:shadow-lg"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{testimonial.content}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {testimonial.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
