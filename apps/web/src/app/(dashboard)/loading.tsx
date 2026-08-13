import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full h-full p-4 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-5 w-64 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-2xl" />
        ))}
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-[200px] w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
