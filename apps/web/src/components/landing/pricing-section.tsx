"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with the essentials",
    features: [
      "AI Planner (basic)",
      "Up to 50 tasks",
      "Calendar integration",
      "Notes (up to 100)",
      "3 habits",
      "2 goals",
      "Basic analytics",
      "Community support",
    ],
    cta: "Get Started",
    highlighted: false,
    href: "/signup",
  },
  {
    name: "Pro",
    price: "$12",
    period: "per month",
    description: "For power users who want the full experience",
    features: [
      "AI Planner (advanced)",
      "Unlimited tasks",
      "Calendar integration",
      "Unlimited notes",
      "Unlimited habits",
      "Unlimited goals",
      "Advanced analytics",
      "Finance tracking",
      "Health tracking",
      "AI Coach",
      "AI Search",
      "Daily AI Reports",
      "Priority support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
    href: "/signup?plan=pro",
  },
  {
    name: "Enterprise",
    price: "$29",
    period: "per month",
    description: "For teams and organizations",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Admin dashboard",
      "SSO / SAML",
      "API access",
      "Custom integrations",
      "Advanced security",
      "Dedicated support",
      "SLA guarantee",
      "Custom onboarding",
    ],
    cta: "Contact Sales",
    highlighted: false,
    href: "/contact",
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="px-4 py-24 lg:py-32">
      <div className="container mx-auto">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
          >
            Simple, transparent{" "}
            <span className="gradient-text">pricing</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-lg text-muted-foreground"
          >
            Start free, upgrade when you&apos;re ready. No hidden fees, no surprises.
          </motion.p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-card p-8 transition-all duration-200",
                plan.highlighted
                  ? "border-primary shadow-xl shadow-primary/10 scale-105"
                  : "hover:shadow-lg",
              )}
            >
              {plan.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
              )}

              <div>
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                <div className="mt-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="ml-1 text-muted-foreground">/{plan.period}</span>
                </div>
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className="mt-8 w-full"
                variant={plan.highlighted ? "default" : "outline"}
                size="lg"
                asChild
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
