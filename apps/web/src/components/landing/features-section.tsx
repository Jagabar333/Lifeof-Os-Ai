"use client";

import { motion } from "framer-motion";
import {
  Brain,
  CalendarDays,
  FileText,
  Target,
  Repeat,
  Wallet,
  Heart,
  BarChart3,
  Search,
  Bell,
  Shield,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Planner",
    description:
      "Let AI plan your day intelligently based on priorities, deadlines, energy levels, and habits.",
  },
  {
    icon: CalendarDays,
    title: "Smart Calendar",
    description:
      "Sync with your life. Smart scheduling that adapts to your workflow and preferences.",
  },
  {
    icon: FileText,
    title: "AI Notes",
    description:
      "Capture ideas with AI-enhanced notes. Auto-organize, summarize, and connect knowledge.",
  },
  {
    icon: Target,
    title: "Goal Tracking",
    description:
      "Set meaningful goals, break them into milestones, and track progress with AI guidance.",
  },
  {
    icon: Repeat,
    title: "Habit Tracking",
    description:
      "Build lasting habits with streaks, reminders, and AI-powered insights on your patterns.",
  },
  {
    icon: Wallet,
    title: "Finance",
    description:
      "Track income, expenses, and investments. AI analyzes spending and suggests optimizations.",
  },
  {
    icon: Heart,
    title: "Health",
    description:
      "Monitor sleep, exercise, mood, and vitals. AI provides personalized health insights.",
  },
  {
    icon: Search,
    title: "AI Search",
    description:
      "Search across everything — notes, tasks, events, goals — with intelligent semantic search.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Understand your productivity patterns with beautiful dashboards and AI-driven reports.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description:
      "Context-aware reminders that know when and how to reach you for maximum effectiveness.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "Your data stays yours. End-to-end encryption, SOC 2 compliant, GDPR ready.",
  },
  {
    icon: Zap,
    title: "Daily AI Reports",
    description:
      "Start each day with an AI-generated summary of your tasks, habits, goals, and insights.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function FeaturesSection() {
  return (
    <section id="features" className="px-4 py-24 lg:py-32">
      <div className="container mx-auto">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
          >
            Everything you need, in{" "}
            <span className="gradient-text">one place</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-muted-foreground"
          >
            Twelve powerful modules working together to make your life organized, productive, and intelligent.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group rounded-xl border bg-card p-6 transition-all duration-200 hover:shadow-lg hover:border-primary/20"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
