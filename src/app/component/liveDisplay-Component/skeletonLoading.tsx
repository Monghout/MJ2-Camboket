// components/LoadingSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingSkeleton() {
  return (
    <div className="dark bg-background min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <Skeleton className="w-full h-[400px] rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[200px] rounded-xl col-span-2" />
          <Skeleton className="h-[200px] rounded-xl" />
        </div>
      </div>
    </div>
  );
}
