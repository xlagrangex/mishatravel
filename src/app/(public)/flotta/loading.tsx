export default function FlottaLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <div className="h-[280px] bg-gray-200 animate-pulse" />

      {/* Intro skeleton */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="h-5 w-3/4 mx-auto bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-1/2 mx-auto bg-gray-200 rounded animate-pulse mt-2" />
        </div>
      </section>

      {/* Ship card grid skeleton */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100"
              >
                <div className="aspect-[16/10] bg-gray-200 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
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
