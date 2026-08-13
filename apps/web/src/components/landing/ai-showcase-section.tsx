"use client";

import { motion } from "framer-motion";
import { Bot, Lightbulb, TrendingUp, Clock } from "lucide-react";

const aiFeatures = [
  {
    icon: Lightbulb,
    title: "Smart Suggestions",
    description:
      "AI analyzes your patterns and suggests optimal times for tasks, breaks, and deep work sessions.",
  },
  {
    icon: TrendingUp,
    title: "Predictive Analytics",
    description:
      "Forecast your productivity trends, habit completion rates, and goal timelines with machine learning.",
  },
  {
    icon: Clock,
    title: "Time Optimization",
    description:
      "Automatically schedule your day based on priorities, energy levels, meeting times, and deadlines.",
  },
];

export function AiShowcaseSection() {
  return (
    <section id="ai" className="px-4 py-24 lg:py-32 bg-muted/30">
      <div className="container mx-auto">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-4 py-1.5 text-sm font-medium backdrop-blur-sm mb-6">
              <Bot className="h-4 w-4 text-primary" />
              AI-Powered Intelligence
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Your life, powered by{" "}
              <span className="gradient-text">artificial intelligence</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              LifeOS AI doesn&apos;t just store your data — it understands it. Our AI engine
              learns from your habits, preferences, and patterns to provide personalized
              recommendations that actually improve your life.
            </p>

            <div className="mt-10 space-y-6">
              {aiFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="rounded-2xl border bg-background/60 p-6 shadow-2xl backdrop-blur-xl">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="ml-2 text-xs text-muted-foreground">AI Daily Report</span>
                </div>

                <div className="rounded-xl bg-muted/50 p-4 space-y-3">
                  <p className="text-sm font-medium">
                    🌅 Good morning! Here&apos;s your AI-generated daily briefing:
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>
                      📋 <strong>5 tasks</strong> are due today. Start with the high-priority
                      report due at 2 PM.
                    </p>
                    <p>
                      🏃 <strong>Habit streak</strong>: You&apos;re on a 24-day meditation streak!
                      Morning sessions work best for you.
                    </p>
                    <p>
                      🎯 <strong>Goal progress</strong>: Your fitness goal is 73% complete.
                      Increase exercise frequency by 1 day to hit your target.
                    </p>
                    <p>
                      💰 <strong>Finance insight</strong>: Spending on dining is 32% above
                      your monthly average. Consider meal planning this week.
                    </p>
                  </div>
                  <div className="rounded-lg bg-primary/10 p-3 text-sm">
                    <p className="font-medium text-primary">
                      💡 AI Recommendation: Schedule deep work from 9–11 AM. Your
                      analytics show peak focus during these hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
