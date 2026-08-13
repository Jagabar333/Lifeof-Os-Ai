"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-destructive/10 blur-3xl" />
      </div>

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
        <AlertTriangle className="h-6 w-6" />
      </div>

      <p className="mt-8 text-7xl font-bold tracking-tight sm:text-8xl">500</p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">Something went wrong</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        An unexpected error occurred. Our team has been notified. Please try again, or return home if the problem persists.
      </p>

      {process.env.NODE_ENV === "development" && (
        <pre className="mt-4 max-w-lg overflow-auto rounded-lg border bg-muted p-3 text-left text-xs text-muted-foreground">
          {error.message}
          {error.digest ? `\nDigest: ${error.digest}` : ""}
        </pre>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button onClick={reset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Try again
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Back to home
          </Link>
        </Button>
      </div>
    </div>
  );
}
