import { getBlogCategories } from "@/lib/supabase/queries/blog";
import BlogPostForm from "@/components/admin/forms/BlogPostForm";

export const dynamic = "force-dynamic";

export default async function NuovoArticoloPage() {
  const categories = await getBlogCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-secondary">
          Nuovo Articolo
        </h1>
        <p className="text-sm text-muted-foreground">
          Crea un nuovo articolo per il blog
        </p>
      </div>

      <BlogPostForm categories={categories} />
    </div>
  );
}
