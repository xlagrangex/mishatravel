export default function AgenziaLoading() {
  return (
    <div className="space-y-6">
      {/* Title skeleton */}
      <div>
        <div className="h-7 w-56 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border bg-white p-6 flex items-center gap-4"
          >
            <div className="h-11 w-11 bg-gray-200 rounded-lg animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Two-column cards skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-white">
            <div className="p-6 border-b">
              <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="p-6 space-y-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <div
                  key={j}
                  className="h-14 bg-gray-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
