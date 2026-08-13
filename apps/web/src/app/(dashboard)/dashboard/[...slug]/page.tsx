import { Sparkles, ArrowLeft, CheckCircle2, Rocket } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const featureData: Record<string, { title: string; description: string; benefits: string[] }> = {
  "daily-summary": {
    title: "Daily Summary",
    description: "Start and end your day with AI-generated briefings on your progress and focus areas.",
    benefits: ["Morning alignment", "Evening reflection", "Goal tracking", "Habit recommendations"]
  },
  journal: {
    title: "Personal Journal",
    description: "A private space to reflect, write, and process your thoughts.",
    benefits: ["Daily prompts", "Sentiment analysis", "Tagging system", "End-to-end encryption"]
  }
};

export default async function ComingSoonPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const featureKey = slug[0] || "feature";
  const feature = featureData[featureKey] || {
    title: `${featureKey.charAt(0).toUpperCase() + featureKey.slice(1)} Feature`,
    description: "We are currently designing and building this module to bring you a seamless experience.",
    benefits: ["Enhanced productivity", "Seamless integration", "AI-powered insights", "Beautiful design"]
  };

  return (
    <div className="mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <Badge variant="secondary" className="gap-1.5 px-3 py-1">
          <Rocket className="h-3.5 w-3.5 text-primary" />
          Coming Soon
        </Badge>
      </div>

      <div className="mb-12 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <Sparkles className="h-10 w-10" />
        </div>
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
          {feature.title}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          {feature.description}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5 shadow-lg">
          <CardHeader>
            <CardTitle>What to expect</CardTitle>
            <CardDescription>Key benefits and capabilities</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {feature.benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-center border-dashed text-center">
          <CardHeader>
            <CardTitle className="text-xl">Be the first to know</CardTitle>
            <CardDescription>
              We're building this feature actively. It will be rolled out to users in upcoming updates.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="flex w-full max-w-xs flex-col gap-2">
              <Button disabled className="w-full">
                Join Waitlist
              </Button>
              <p className="text-xs text-muted-foreground">
                (Waitlist feature is active for pro members)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
