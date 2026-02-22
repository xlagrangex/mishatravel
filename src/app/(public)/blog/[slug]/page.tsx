import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import BlogCard from "@/components/cards/BlogCard";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, ArrowLeft, Clock, ChevronRight } from "lucide-react";
import { getBlogPostBySlug, getPublishedBlogPosts } from "@/lib/supabase/queries/blog";
import { generateBlogPostMetadata } from "@/lib/seo/metadata";
import { articleSchema, breadcrumbSchema } from "@/lib/seo/structured-data";
import AdminEditSetter from "@/components/admin/AdminEditSetter";
import { getAuthContext } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Articolo non trovato" };
  return generateBlogPostMetadata(post);
}

function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, "");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const { role } = await getAuthContext();
  const isAdmin = role === "super_admin" || role === "admin" || role === "operator";

  const dateStr = post.published_at ?? post.created_at;
  const formattedDate = new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));

  const categoryName = post.category?.name ?? "Generale";
  const coverImage = post.cover_image_url ?? "/images/blog/placeholder.jpg";
  const content = post.content ?? "";
  const readingTime = estimateReadingTime(content);

  // Fetch related posts (same category first, then others)
  const allPosts = await getPublishedBlogPosts();
  const otherPosts = allPosts.filter((p) => p.slug !== slug);
  const sameCategoryPosts = otherPosts.filter((p) => p.category_id === post.category_id);
  const differentCategoryPosts = otherPosts.filter((p) => p.category_id !== post.category_id);
  const relatedPosts = [...sameCategoryPosts, ...differentCategoryPosts].slice(0, 3);

  return (
    <>
      {isAdmin && <AdminEditSetter url={`/admin/blog/${post.id}/modifica`} />}

      {/* Hero - Full-width immersive cover */}
      <section className="relative w-full h-[50vh] min-h-[400px] max-h-[600px] flex items-end overflow-hidden">
        <Image
          src={coverImage}
          alt={post.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Content overlay */}
        <div className="relative z-10 w-full pb-10 pt-20">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1.5 text-sm text-white/60 mb-4">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="size-3" />
              <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
              <ChevronRight className="size-3" />
              <span className="text-white/80 truncate max-w-[200px]">{post.title}</span>
            </nav>

            {/* Category + Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge className="bg-[#C41E2F] text-white border-none text-xs px-3 py-1 rounded-full">
                {categoryName}
              </Badge>
              <span className="flex items-center gap-1.5 text-sm text-white/70">
                <CalendarDays className="size-3.5" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-white/70">
                <Clock className="size-3.5" />
                {readingTime} min di lettura
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white font-[family-name:var(--font-poppins)] leading-tight">
              {post.title}
            </h1>
          </div>
        </div>
      </section>

      {/* Article body */}
      <section className="bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto py-12 md:py-16">
            {/* Back link */}
            <Link href="/blog" className="inline-flex items-center gap-2 text-[#C41E2F] hover:underline text-sm mb-8 group">
              <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
              Tutti gli articoli
            </Link>

            {/* Excerpt / Lead */}
            {post.excerpt && (
              <p className="text-xl md:text-2xl text-gray-500 leading-relaxed mb-10 font-light border-l-4 border-[#C41E2F] pl-6">
                {post.excerpt}
              </p>
            )}

            {/* Content */}
            <div
              className="prose prose-lg max-w-none text-gray-700 leading-relaxed prose-headings:text-[#1B2D4F] prose-headings:font-[family-name:var(--font-poppins)] prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:mb-5 prose-a:text-[#C41E2F] prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-blockquote:border-l-[#C41E2F] prose-blockquote:text-gray-500 prose-blockquote:not-italic prose-strong:text-gray-900 prose-em:text-gray-600"
              dangerouslySetInnerHTML={{ __html: content }}
            />

            {/* Divider */}
            <div className="border-t border-gray-200 mt-14 pt-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Badge variant="outline" className="text-xs">
                    {categoryName}
                  </Badge>
                  <span>{formattedDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)]">
                Potrebbe interessarti
              </h2>
              <Link href="/blog" className="text-sm text-[#C41E2F] hover:underline font-medium">
                Tutti gli articoli &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((p) => (
                <BlogCard
                  key={p.slug}
                  slug={p.slug}
                  title={p.title}
                  category={p.category?.name ?? "Generale"}
                  image={p.cover_image_url ?? "/images/blog/placeholder.jpg"}
                  date={p.published_at ?? p.created_at}
                  excerpt={p.excerpt ?? ""}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema(post)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Blog", url: "/blog" },
              { name: post.title, url: `/blog/${post.slug}` },
            ])
          ),
        }}
      />
    </>
  );
}
