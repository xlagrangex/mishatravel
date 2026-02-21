import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

interface Breadcrumb {
  label: string;
  href: string;
}

interface PageHeroProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  breadcrumbs?: Breadcrumb[];
}

export default function PageHero({
  title,
  subtitle,
  backgroundImage,
  breadcrumbs,
}: PageHeroProps) {
  return (
    <section className="relative w-full h-[300px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      {backgroundImage ? (
        <Image
          src={backgroundImage}
          alt={title}
          fill
          className="object-cover"
          priority
        />
      ) : (
        <div className="absolute inset-0 bg-[#1B2D4F]" />
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50 z-[1]" />

      {/* Content */}
      <div className="relative z-[2] text-center text-white px-4 max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-[family-name:var(--font-poppins)] mb-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg md:text-xl text-white/80 mt-2">{subtitle}</p>
        )}

        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="mt-6 flex items-center justify-center gap-1.5 text-sm text-white/70"
          >
            <Link
              href="/"
              className="hover:text-white transition-colors"
            >
              Pagina iniziale
            </Link>
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.href} className="flex items-center gap-1.5">
                <ChevronRight className="size-3.5" />
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-white font-medium">{crumb.label}</span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="hover:text-white transition-colors"
                  >
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        )}
      </div>
    </section>
  );
}
