import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-secondary/80",
        className
      )}
      {...props}
    />
  );
}

// Preset skeleton variants for common use cases
export function SkeletonText({ className, ...props }: SkeletonProps) {
  return <Skeleton className={cn("h-4 w-full", className)} {...props} />;
}

export function SkeletonHeading({ className, ...props }: SkeletonProps) {
  return <Skeleton className={cn("h-8 w-48", className)} {...props} />;
}

export function SkeletonAvatar({ className, ...props }: SkeletonProps) {
  return <Skeleton className={cn("h-10 w-10 rounded-full", className)} {...props} />;
}

export function SkeletonCard({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn("rounded-xl border border-border/50 bg-card/50 p-6", className)} {...props}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

export function SkeletonListItem({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-lg border border-border/50 p-4",
        className
      )}
      {...props}
    >
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="flex flex-col items-end gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}