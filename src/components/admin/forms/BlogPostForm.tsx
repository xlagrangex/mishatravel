"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BlogPost, BlogCategory } from "@/lib/types";
import { saveBlogPost } from "@/app/admin/blog/actions";
import ImageUpload from "@/components/admin/ImageUpload";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const blogPostSchema = z.object({
  title: z.string().min(1, "Il titolo è obbligatorio"),
  slug: z.string().min(1, "Lo slug è obbligatorio"),
  category_id: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  cover_image_url: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  status: z.enum(["draft", "published"]),
  published_at: z.string().optional(),
});

type BlogPostFormValues = z.infer<typeof blogPostSchema>;

// ---------------------------------------------------------------------------
// Slug utility
// ---------------------------------------------------------------------------

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[àáâãäå]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[ñ]/g, "n")
    .replace(/[ç]/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface BlogPostFormProps {
  initialData?: BlogPost;
  categories: BlogCategory[];
}

export default function BlogPostForm({ initialData, categories }: BlogPostFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      slug: initialData?.slug ?? "",
      category_id: initialData?.category_id ?? "",
      excerpt: initialData?.excerpt ?? "",
      content: initialData?.content ?? "",
      cover_image_url: initialData?.cover_image_url ?? "",
      meta_title: initialData?.meta_title ?? "",
      meta_description: initialData?.meta_description ?? "",
      status: initialData?.status ?? "draft",
      published_at: initialData?.published_at
        ? initialData.published_at.substring(0, 10)
        : "",
    },
  });

  // Auto-generate slug from title
  const titleValue = watch("title");
  useEffect(() => {
    // Only auto-generate if no initial data (new post)
    if (!initialData) {
      setValue("slug", generateSlug(titleValue));
    }
  }, [titleValue, initialData, setValue]);

  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (data: BlogPostFormValues) => {
    setServerError(null);
    try {
      const result = await saveBlogPost({
        ...data,
        id: initialData?.id,
        category_id: data.category_id || null,
        cover_image_url: data.cover_image_url || null,
        excerpt: data.excerpt || null,
        content: data.content || null,
        meta_title: data.meta_title || null,
        meta_description: data.meta_description || null,
        published_at: data.published_at || null,
      });
      if (!result.success) {
        setServerError(result.error);
      } else {
        router.push("/admin/blog");
      }
    } catch {
      setServerError("Errore imprevisto durante il salvataggio.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content - Left Column (2/3) */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">
                Informazioni Articolo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Titolo */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Titolo <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="es. 10 cose da fare a Mosca"
                  {...register("title")}
                  aria-invalid={!!errors.title}
                />
                {errors.title && (
                  <p className="text-xs text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug">
                  Slug <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="slug"
                  placeholder="es. 10-cose-da-fare-a-mosca"
                  {...register("slug")}
                  aria-invalid={!!errors.slug}
                />
                <p className="text-xs text-muted-foreground">
                  Generato automaticamente dal titolo. Puoi modificarlo
                  manualmente.
                </p>
                {errors.slug && (
                  <p className="text-xs text-destructive">
                    {errors.slug.message}
                  </p>
                )}
              </div>

              {/* Categoria */}
              <div className="space-y-2">
                <Label htmlFor="category_id">Categoria</Label>
                <Controller
                  name="category_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="category_id" className="w-full">
                        <SelectValue placeholder="Seleziona categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Estratto */}
              <div className="space-y-2">
                <Label htmlFor="excerpt">Estratto</Label>
                <Textarea
                  id="excerpt"
                  placeholder="Breve riassunto dell'articolo (visibile nelle anteprime)..."
                  rows={3}
                  {...register("excerpt")}
                />
              </div>

              {/* Contenuto */}
              <div className="space-y-2">
                <Label>Contenuto</Label>
                <Controller
                  name="content"
                  control={control}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      placeholder="Scrivi il contenuto dell'articolo..."
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Right Column (1/3) */}
        <div className="space-y-6">
          {/* Pubblicazione */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">
                Pubblicazione
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="status-switch">Stato</Label>
                  <p className="text-xs text-muted-foreground">
                    {watch("status") === "published"
                      ? "Pubblicato"
                      : "Bozza"}
                  </p>
                </div>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="status-switch"
                      checked={field.value === "published"}
                      onCheckedChange={(checked) =>
                        field.onChange(checked ? "published" : "draft")
                      }
                    />
                  )}
                />
              </div>

              {/* Data pubblicazione */}
              <div className="space-y-2">
                <Label htmlFor="published_at">Data Pubblicazione</Label>
                <Input
                  id="published_at"
                  type="date"
                  {...register("published_at")}
                />
                <p className="text-xs text-muted-foreground">
                  Lascia vuoto per usare la data corrente alla pubblicazione.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Immagine Copertina */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">
                Immagine Copertina
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Controller
                name="cover_image_url"
                control={control}
                render={({ field }) => (
                  <ImageUpload
                    value={field.value ? [field.value] : []}
                    onUpload={(urls) => field.onChange(urls[0] || "")}
                    bucket="blog"
                  />
                )}
              />
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  placeholder="Titolo per i motori di ricerca"
                  {...register("meta_title")}
                />
                <p className="text-xs text-muted-foreground">
                  Se vuoto, verrà usato il titolo dell&apos;articolo.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  placeholder="Descrizione per i motori di ricerca..."
                  rows={3}
                  {...register("meta_description")}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Error Message */}
      {serverError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      {/* Form Actions */}
      <div className="flex items-center gap-3 border-t pt-6">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Salvataggio..."
            : initialData
              ? "Aggiorna Articolo"
              : "Crea Articolo"}
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/blog">Annulla</Link>
        </Button>
      </div>
    </form>
  );
}
