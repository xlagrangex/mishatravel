import Image from "next/image";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
    <Link
      href={`/blog/${slug}`}
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute top-3 left-3">
          <Badge className="bg-[#C41E2F] text-white border-none text-xs px-2.5 py-1 rounded-full shadow-sm">
            {category}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-2 flex-1">
        <p className="flex items-center gap-1.5 text-xs text-gray-400">
          <CalendarDays className="size-3" />
          {formattedDate}
        </p>

        <h3 className="font-semibold text-lg text-gray-900 font-[family-name:var(--font-poppins)] line-clamp-2 group-hover:text-[#C41E2F] transition-colors">
          {title}
        </h3>

        <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed flex-1">
          {excerpt}
        </p>

        <span className="text-sm font-medium text-[#C41E2F] mt-2 group-hover:underline">
          Leggi di pi&ugrave; &rarr;
        </span>
      </div>
    </Link>
  );
}
