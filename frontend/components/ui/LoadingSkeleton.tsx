export function BookCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-5 overflow-hidden">
      <div className="flex gap-4">
        <div className="w-16 h-20 rounded-xl shimmer-bg shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 rounded shimmer-bg w-4/5" />
          <div className="h-3 rounded shimmer-bg w-3/5" />
          <div className="h-3 rounded shimmer-bg w-2/5" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex justify-between">
          <div className="h-3 rounded shimmer-bg w-1/3" />
          <div className="h-3 rounded shimmer-bg w-1/6" />
        </div>
        <div className="h-1.5 rounded-full shimmer-bg w-full" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="h-3 rounded shimmer-bg w-1/2 mb-3" />
      <div className="h-8 rounded shimmer-bg w-2/3" />
    </div>
  );
}

export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded shimmer-bg"
          style={{ width: `${75 + Math.sin(i) * 15}%` }}
        />
      ))}
    </div>
  );
}

export default function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <BookCardSkeleton key={i} />
      ))}
    </div>
  );
}
