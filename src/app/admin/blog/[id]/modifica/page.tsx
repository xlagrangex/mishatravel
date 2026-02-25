import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import BlogPostForm from "@/components/admin/forms/BlogPostForm";
import ActivityLog from "@/components/admin/ActivityLog";
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
          {post.title}
        </h1>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          Vedi anteprima:
          <Link
            href={`/blog/${post.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            /blog/{post.slug}
            <ExternalLink className="h-3 w-3" />
          </Link>
        </p>
      </div>

      <ActivityLog entityType="blog" entityId={id} />
      <BlogPostForm initialData={post} categories={categories} />
    </div>
  );
}
