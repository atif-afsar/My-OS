interface LoadingSkeletonProps {
  variant?: "card" | "list" | "text";
  count?: number;
}

export default function LoadingSkeleton({
  variant = "card",
  count = 1,
}: LoadingSkeletonProps) {
  const items = Array.from({ length: count });

  if (variant === "text") {
    return (
      <div className="flex flex-col gap-2 w-full animate-pulse">
        <div className="h-4 bg-secondary rounded-md w-3/4" />
        <div className="h-3.5 bg-secondary rounded-md w-1/2" />
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className="flex flex-col gap-2 w-full">
        {items.map((_, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-4 border border-border bg-card rounded-xl animate-pulse"
          >
            <div className="flex items-center gap-3 w-3/4">
              <div className="w-5.5 h-5.5 rounded bg-secondary shrink-0" />
              <div className="flex flex-col gap-1.5 w-full">
                <div className="h-3.5 bg-secondary rounded w-2/3" />
                <div className="h-2.5 bg-secondary rounded w-1/3" />
              </div>
            </div>
            <div className="w-4 h-4 bg-secondary rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {items.map((_, idx) => (
        <div
          key={idx}
          className="p-5 rounded-2xl border border-border bg-card flex flex-col gap-3 shadow-sm animate-pulse"
        >
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1.5 w-1/2">
              <div className="h-3.5 bg-secondary rounded w-3/4" />
              <div className="h-2.5 bg-secondary rounded w-1/2" />
            </div>
            <div className="w-12 h-5 bg-secondary rounded-full" />
          </div>
          <div className="h-14 bg-secondary rounded-xl mt-1 w-full" />
          <div className="h-3 bg-secondary rounded mt-1 w-1/4" />
        </div>
      ))}
    </div>
  );
}
