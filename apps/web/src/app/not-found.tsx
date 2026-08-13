import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
        <Sparkles className="h-6 w-6 text-primary-foreground" />
      </div>

      <p className="mt-8 text-7xl font-bold tracking-tight sm:text-8xl">404</p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It may have been moved, deleted, or never existed.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Back to home
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
