"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 py-24 lg:py-32">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute left-0 bottom-0 h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="container mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/60 px-4 py-1.5 text-sm font-medium backdrop-blur-sm"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          Powered by Advanced AI
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
        >
          The Intelligent Operating
          <br />
          System For{" "}
          <span className="gradient-text">Your Life</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
        >
          Organize every aspect of your life from one intelligent dashboard.
          AI-powered planning, smart calendar, goals, habits, finance, health & more — all in one place.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <Button size="xl" asChild>
            <Link href="/signup">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="xl" variant="outline" asChild>
            <Link href="#features">Explore Features</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-20 w-full max-w-5xl"
        >
          <div className="relative rounded-2xl border bg-background/40 p-2 shadow-2xl backdrop-blur-xl">
            <div className="rounded-xl bg-gradient-to-br from-primary/5 via-background to-blue-500/5 p-8 lg:p-12">
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
                {[
                  { label: "Tasks", value: "12", sub: "completed today" },
                  { label: "Goals", value: "73%", sub: "on track" },
                  { label: "Streak", value: "24", sub: "day streak" },
                  { label: "Score", value: "92", sub: "productivity" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border bg-background/80 p-4 backdrop-blur-sm"
                  >
                    <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                    <p className="mt-1 text-2xl font-bold lg:text-3xl">{stat.value}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{stat.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
