import Image from "next/image";
import Link from "next/link";

interface DestinationCardProps {
  slug: string;
  name: string;
  image: string;
}

export default function DestinationCard({
  slug,
  name,
  image,
}: DestinationCardProps) {
  return (
    <Link
      href={`/destinazioni/${slug}`}
      className="group relative block rounded-lg overflow-hidden aspect-square"
    >
      {/* Background image */}
      <Image
        src={image}
        alt={name}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-110"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-colors group-hover:from-black/80" />

      {/* Name */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <h3 className="text-white text-lg md:text-xl font-semibold text-center px-4 font-[family-name:var(--font-poppins)] drop-shadow-lg">
          {name}
        </h3>
      </div>
    </Link>
  );
}
