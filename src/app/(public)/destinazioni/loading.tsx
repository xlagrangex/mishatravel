export default function DestinazioniLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <div className="h-[280px] bg-gray-200 animate-pulse" />

      {/* Filter tabs skeleton */}
      <div className="py-6 bg-white border-b">
        <div className="container mx-auto px-4 flex gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-9 w-28 bg-gray-200 rounded-full animate-pulse"
            />
          ))}
        </div>
      </div>

      {/* Card grid skeleton */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100"
              >
                <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
