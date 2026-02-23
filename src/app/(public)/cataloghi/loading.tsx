export default function CataloghiLoading() {
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

      {/* Catalog cards skeleton */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100"
              >
                <div className="aspect-[3/4] bg-gray-200 animate-pulse" />
                <div className="p-6 space-y-3">
                  <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
                  <div className="flex gap-3 pt-2">
                    <div className="h-10 flex-1 bg-gray-200 rounded animate-pulse" />
                    <div className="h-10 flex-1 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
