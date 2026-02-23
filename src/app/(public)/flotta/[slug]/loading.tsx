export default function ShipDetailLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <div className="h-[280px] bg-gray-200 animate-pulse" />

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          {/* Two-column layout skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="aspect-video bg-gray-200 rounded-lg animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>

          {/* Cabin details skeleton */}
          <div className="mb-12">
            <div className="h-7 w-48 bg-gray-200 rounded animate-pulse mb-6" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Services skeleton */}
          <div className="mb-12">
            <div className="h-7 w-40 bg-gray-200 rounded animate-pulse mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-5 w-3/4 bg-gray-200 rounded animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
