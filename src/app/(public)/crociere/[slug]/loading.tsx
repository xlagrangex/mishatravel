export default function CruiseDetailLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <div className="h-[280px] bg-gray-200 animate-pulse" />

      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          {/* Title + meta skeleton */}
          <div className="mb-8">
            <div className="h-9 w-2/3 bg-gray-200 rounded animate-pulse mb-3" />
            <div className="flex gap-4">
              <div className="h-5 w-28 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>

          {/* Tabs skeleton */}
          <div className="flex gap-2 border-b mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-10 w-28 bg-gray-200 rounded-t animate-pulse"
              />
            ))}
          </div>

          {/* Content area skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-4">
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Sidebar skeleton */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-10 w-full bg-gray-300 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
