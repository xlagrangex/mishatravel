import Image from "next/image";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface BlogCardProps {
  slug: string;
  title: string;
  category: string;
  image: string;
  date: string;
  excerpt: string;
}

export default function BlogCard({
  slug,
  title,
  category,
  image,
  date,
  excerpt,
}: BlogCardProps) {
  const formattedDate = new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));

  return (
    <div className="group bg-white rounded-lg overflow-hidden shadow-sm card-hover border border-gray-100">
      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3">
        {/* Category badge */}
        <Badge className="bg-[#C41E2F] text-white border-none text-xs w-fit px-2.5 py-1 rounded-md">
          {category}
        </Badge>

        <h3 className="font-semibold text-lg text-gray-900 font-[family-name:var(--font-poppins)] line-clamp-2">
          {title}
        </h3>

        {/* Date */}
        <p className="flex items-center gap-1.5 text-sm text-gray-400">
          <CalendarDays className="size-3.5" />
          {formattedDate}
        </p>

        {/* Excerpt */}
        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
          {excerpt}
        </p>

        {/* CTA */}
        <Button
          asChild
          variant="outline"
          className="w-full border-[#C41E2F] text-[#C41E2F] hover:bg-[#C41E2F] hover:text-white mt-1"
        >
          <Link href={`/blog/${slug}`}>Leggi di Pi&ugrave;</Link>
        </Button>
      </div>
    </div>
  );
}
