export default function BlogDetailLoading() {
  return (
    <>
      {/* Hero image skeleton */}
      <div className="relative w-full h-[50vh] min-h-[400px] max-h-[600px] bg-gray-200 animate-pulse" />

      {/* Article body skeleton */}
      <section className="bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto py-12 md:py-16 space-y-6">
            {/* Back link */}
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />

            {/* Excerpt */}
            <div className="border-l-4 border-gray-200 pl-6 space-y-2">
              <div className="h-5 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Content paragraphs */}
            <div className="space-y-4 pt-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Related posts skeleton */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="h-7 w-48 bg-gray-200 rounded animate-pulse mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100"
              >
                <div className="aspect-[16/10] bg-gray-200 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
