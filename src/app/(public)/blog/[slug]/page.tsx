import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import PageHero from "@/components/layout/PageHero";
import BlogCard from "@/components/cards/BlogCard";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, ArrowLeft } from "lucide-react";
import { getBlogPostBySlug, getPublishedBlogPosts } from "@/lib/supabase/queries/blog";
import { generateBlogPostMetadata } from "@/lib/seo/metadata";
import { articleSchema, breadcrumbSchema } from "@/lib/seo/structured-data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Articolo non trovato" };
  return generateBlogPostMetadata(post);
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const dateStr = post.published_at ?? post.created_at;
  const formattedDate = new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));

  const categoryName = post.category?.name ?? "Generale";
  const coverImage = post.cover_image_url ?? "/images/blog/placeholder.jpg";
  const content = post.content ?? "";

  // Fetch related posts (other published posts, excluding current)
  const allPosts = await getPublishedBlogPosts();
  const relatedPosts = allPosts.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <>
      <PageHero
        title={post.title}
        breadcrumbs={[
          { label: "Blog", href: "/blog" },
          { label: post.title, href: `/blog/${post.slug}` },
        ]}
        backgroundImage={coverImage}
      />

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Link href="/blog" className="inline-flex items-center gap-2 text-[#C41E2F] hover:underline text-sm mb-6">
              <ArrowLeft className="size-4" />
              Torna al Blog
            </Link>

            <div className="flex items-center gap-3 mb-6">
              <Badge className="bg-[#C41E2F] text-white">{categoryName}</Badge>
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <CalendarDays className="size-3.5" />
                {formattedDate}
              </span>
            </div>

            <div className="relative aspect-video rounded-lg overflow-hidden mb-8">
              <Image src={coverImage} alt={post.title} fill className="object-cover" priority />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-6">
              {post.title}
            </h1>

            <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
              {content.split("\n\n").map((paragraph, i) => (
                <p key={i} className="mb-4">{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {relatedPosts.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-6">
              Articoli Correlati
            </h2>
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
