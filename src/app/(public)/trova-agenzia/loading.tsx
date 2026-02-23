export default function TrovaAgenziaLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <div className="h-[280px] bg-gray-200 animate-pulse" />

      {/* Search + results skeleton */}
      <section className="py-12 bg-[#F9FAFB]">
        <div className="container mx-auto px-4">
          {/* Search bar */}
          <div className="max-w-xl mx-auto mb-10">
            <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse" />
          </div>

          {/* Agency cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 space-y-3"
              >
                <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
