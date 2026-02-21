import PageHero from "@/components/layout/PageHero";
import BlogCard from "@/components/cards/BlogCard";
import { blogPosts } from "@/lib/data";

export default function BlogPage() {
  return (
    <>
      <PageHero
        title="Blog di Viaggio"
        subtitle="Storie, consigli e approfondimenti dai nostri viaggi"
        backgroundImage="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&h=600&fit=crop"
        breadcrumbs={[{ label: "Blog", href: "/blog" }]}
      />

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-gray-600 leading-relaxed text-lg">
            Approfondimenti culturali, racconti di viaggio e curiosita dalle nostre destinazioni.
            Lasciati ispirare per il tuo prossimo viaggio con Misha Travel.
          </p>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <BlogCard
                key={post.slug}
                slug={post.slug}
                title={post.title}
                category={post.category}
                image={post.image}
                date={post.date}
                excerpt={post.excerpt}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
