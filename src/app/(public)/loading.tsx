export default function HomeLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <div className="relative h-[70vh] min-h-[500px] bg-gray-200 animate-pulse" />

      {/* Destinations carousel skeleton */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mx-auto mb-8" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="shrink-0 w-48 h-28 bg-gray-200 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Latest additions skeleton */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="h-8 w-72 bg-gray-200 rounded animate-pulse mx-auto mb-3" />
          <div className="h-1 w-16 bg-gray-200 rounded animate-pulse mx-auto mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100"
              >
                <div className="aspect-[16/10] bg-gray-200 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Departures timeline skeleton */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mx-auto mb-3" />
          <div className="h-1 w-16 bg-gray-200 rounded animate-pulse mx-auto mb-12" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-20 bg-gray-100 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
