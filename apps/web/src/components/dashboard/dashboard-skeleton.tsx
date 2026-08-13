import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <Skeleton className="h-24 w-full" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-xl border p-6">
            <div className="flex justify-between">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-5 w-12" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 rounded-xl border p-6 lg:col-span-2">
          <Skeleton className="h-6 w-32" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
        <div className="space-y-3 rounded-xl border p-6">
          <Skeleton className="h-6 w-24" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
