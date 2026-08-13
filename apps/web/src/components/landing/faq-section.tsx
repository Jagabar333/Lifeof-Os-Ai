"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "What is LifeOS AI?",
    answer:
      "LifeOS AI is an AI-powered personal operating system that combines task management, calendar, notes, goals, habits, finance tracking, health monitoring, and AI coaching into one intelligent dashboard. It's designed to be the single platform for organizing every aspect of your life.",
  },
  {
    question: "How does the AI Planner work?",
    answer:
      "The AI Planner analyzes your tasks, calendar events, habits, goals, and personal preferences to create an optimized daily schedule. It considers your energy patterns, deadline priorities, and historical productivity data to suggest the best times for focused work, meetings, breaks, and personal activities.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. We use end-to-end encryption, are SOC 2 Type II compliant, and GDPR ready. Your data is stored in enterprise-grade infrastructure with automatic backups. We never sell your data or use it to train models without your explicit consent.",
  },
  {
    question: "Can I integrate with other tools?",
    answer:
      "Yes! LifeOS AI integrates with Google Calendar, Apple Calendar, Notion, and other popular productivity tools. Pro and Enterprise plans include API access for custom integrations.",
  },
  {
    question: "What AI models do you use?",
    answer:
      "We use a combination of Google Gemini and OpenAI models, selected based on the specific task. LangChain orchestrates our AI pipeline, and we use Qdrant for fast semantic search across all your data.",
  },
  {
    question: "Can I use LifeOS AI for my team?",
    answer:
      "Yes! Our Enterprise plan includes team collaboration features, admin dashboards, SSO/SAML authentication, and dedicated support. It's perfect for teams that want to stay aligned on goals and habits.",
  },
  {
    question: "Is there a free trial for Pro?",
    answer:
      "Yes, every new account gets a 14-day free trial of the Pro plan with all features unlocked. No credit card required to start.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes, you can cancel your subscription at any time. You'll continue to have access to your plan features until the end of your billing period. Your data remains accessible on the Free plan.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="px-4 py-24 lg:py-32">
      <div className="container mx-auto">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
          >
            Frequently asked{" "}
            <span className="gradient-text">questions</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-muted-foreground"
          >
            Everything you need to know about LifeOS AI.
          </motion.p>
        </div>

        <div className="mx-auto mt-16 max-w-3xl divide-y">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="py-5"
            >
              <button
                className="flex w-full items-center justify-between text-left"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                aria-expanded={openIndex === index}
              >
                <span className="text-sm font-semibold sm:text-base">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200",
                    openIndex === index && "rotate-180",
                  )}
                />
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-200",
                  openIndex === index ? "mt-3 max-h-96" : "max-h-0",
                )}
              >
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
