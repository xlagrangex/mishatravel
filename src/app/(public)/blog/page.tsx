import PageHero from "@/components/layout/PageHero";
import BlogCard from "@/components/cards/BlogCard";
import { getPublishedBlogPosts } from "@/lib/supabase/queries/blog";

export const dynamic = "force-dynamic";

export const revalidate = 600; // ISR: revalidate every 10 minutes

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();

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
          {posts.length === 0 ? (
            <p className="text-center text-gray-500 py-12">
              Nessun articolo pubblicato al momento. Torna a trovarci presto!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <BlogCard
                  key={post.slug}
                  slug={post.slug}
                  title={post.title}
                  category={post.category?.name ?? "Generale"}
                  image={post.cover_image_url ?? "/images/blog/placeholder.jpg"}
                  date={post.published_at ?? post.created_at}
                  excerpt={post.excerpt ?? ""}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
