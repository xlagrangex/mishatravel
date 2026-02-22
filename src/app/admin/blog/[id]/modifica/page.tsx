import { notFound } from "next/navigation";
import BlogPostForm from "@/components/admin/forms/BlogPostForm";
import { getBlogPostById, getBlogCategories } from "@/lib/supabase/queries/blog";

export const dynamic = "force-dynamic";

interface ModificaArticoloPageProps {
  params: Promise<{ id: string }>;
}

export default async function ModificaArticoloPage({
  params,
}: ModificaArticoloPageProps) {
  const { id } = await params;
  const [post, categories] = await Promise.all([
    getBlogPostById(id),
    getBlogCategories(),
  ]);

  if (!post) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-secondary">
          Modifica Articolo
        </h1>
        <p className="text-sm text-muted-foreground">
          Modifica i dettagli di &ldquo;{post.title}&rdquo;
        </p>
      </div>

      <BlogPostForm initialData={post} categories={categories} />
    </div>
  );
}
