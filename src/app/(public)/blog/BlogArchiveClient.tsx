"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import BlogCard from "@/components/cards/BlogCard";
import type { BlogCategory } from "@/lib/types";
import type { BlogPostWithCategory } from "@/lib/supabase/queries/blog";

interface Props {
  posts: BlogPostWithCategory[];
  categories: BlogCategory[];
}

function estimateReadingTime(content: string | null): number {
  if (!content) return 1;
  const text = content.replace(/<[^>]*>/g, "");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function BlogArchiveClient({ posts, categories }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? posts.filter((p) => p.category_id === activeCategory)
    : posts;

  const [featured, ...rest] = filtered;

  return (
    <>
      {/* Intro */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-gray-600 leading-relaxed text-lg">
            Approfondimenti culturali, racconti di viaggio e curiosita dalle nostre destinazioni.
            Lasciati ispirare per il tuo prossimo viaggio con Misha Travel.
          </p>
        </div>
      </section>

      {/* Category filter */}
      {categories.length > 0 && (
        <section className="bg-white pb-2">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === null
                    ? "bg-[#C41E2F] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Tutti
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() =>
                    setActiveCategory(activeCategory === cat.id ? null : cat.id)
                  }
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === cat.id
                      ? "bg-[#C41E2F] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Posts */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-500 py-12">
              Nessun articolo pubblicato al momento. Torna a trovarci presto!
            </p>
          ) : (
            <>
              {/* Featured post */}
              {featured && (
                <FeaturedPost post={featured} />
              )}

              {/* Grid */}
              {rest.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
                  {rest.map((post) => (
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
            </>
          )}
        </div>
      </section>
    </>
  );
}

function FeaturedPost({ post }: { post: BlogPostWithCategory }) {
  const coverImage = post.cover_image_url ?? "/images/blog/placeholder.jpg";
  const categoryName = post.category?.name ?? "Generale";
  const dateStr = post.published_at ?? post.created_at;
  const formattedDate = new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
  const readingTime = estimateReadingTime(post.content);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100"
    >
      <div className="grid md:grid-cols-2 gap-0">
        {/* Image */}
        <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[360px] overflow-hidden">
          <Image
            src={coverImage}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 flex flex-col justify-center">
          <Badge className="bg-[#C41E2F] text-white border-none text-xs px-3 py-1 rounded-full w-fit mb-4">
            {categoryName}
          </Badge>

          <h2 className="text-2xl md:text-3xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-3 group-hover:text-[#C41E2F] transition-colors line-clamp-3">
            {post.title}
          </h2>

          {post.excerpt && (
            <p className="text-gray-500 leading-relaxed mb-4 line-clamp-3">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-400 mt-auto">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5" />
              {readingTime} min di lettura
            </span>
          </div>

          <span className="text-sm font-medium text-[#C41E2F] mt-4 group-hover:underline">
            Leggi l&apos;articolo &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
