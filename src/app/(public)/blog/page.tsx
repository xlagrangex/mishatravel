import PageHero from "@/components/layout/PageHero";
import { getPublishedBlogPosts, getBlogCategories } from "@/lib/supabase/queries/blog";
import BlogArchiveClient from "./BlogArchiveClient";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([
    getPublishedBlogPosts(),
    getBlogCategories(),
  ]);

  return (
    <>
      <PageHero
        title="Blog di Viaggio"
        subtitle="Storie, consigli e approfondimenti dai nostri viaggi"
        backgroundImage="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&h=600&fit=crop"
        breadcrumbs={[{ label: "Blog", href: "/blog" }]}
      />

      <BlogArchiveClient posts={posts} categories={categories} />
    </>
  );
}
