import { Sparkles, Wrench } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-warning/10 blur-3xl" />
      </div>

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10 text-warning">
        <Wrench className="h-6 w-6" />
      </div>

      <div className="mt-8 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
          <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold">LifeOS AI</span>
      </div>

      <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
        We&apos;ll be right back
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        LifeOS AI is undergoing scheduled maintenance to bring you new features and improvements.
        We expect to be back online shortly. Thank you for your patience.
      </p>

      <div className="mt-6 inline-flex items-center gap-2 rounded-full border bg-background/60 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-warning" />
        </span>
        Maintenance in progress
      </div>
    </div>
  );
}
