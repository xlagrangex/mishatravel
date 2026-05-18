import Link from "next/link";
import Image from "next/image";
import { Radio, ArrowRight } from "lucide-react";

interface InterviewQuoteBoxProps {
  quote: string;
  attribution?: string;
  className?: string;
}

export default function InterviewQuoteBox({
  quote,
  attribution = "Alessia Cardone — MishaTravel",
  className = "",
}: InterviewQuoteBoxProps) {
  return (
    <section className={`py-16 md:py-20 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl bg-gradient-to-br from-[#1B2D4F] to-[#0f1d36] shadow-xl">
          <div className="grid md:grid-cols-5">
            {/* Thumbnail */}
            <Link
              href="/chi-siamo/intervista-radio-crociere-fluviali"
              className="group relative aspect-video md:col-span-2 md:aspect-auto"
              aria-label="Guarda l'intervista completa"
            >
              <Image
                src="https://i.ytimg.com/vi/uT8C58QECZw/maxresdefault.jpg"
                alt="Intervista a MishaTravel su Storytime"
                fill
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#C41E2F] shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:bg-white md:h-16 md:w-16">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="ml-0.5 size-6 text-white transition-colors duration-300 group-hover:text-[#C41E2F] md:size-7"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Content */}
            <div className="flex flex-col justify-center p-8 md:col-span-3 md:p-10 lg:p-12">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white/90">
                <Radio className="size-3" />
                La parola al nostro responsabile
              </span>

              <blockquote className="mt-5">
                <p className="font-[family-name:var(--font-poppins)] text-xl font-bold leading-snug text-white md:text-2xl">
                  <span className="text-[#C41E2F]">&ldquo;</span>
                  {quote}
                  <span className="text-[#C41E2F]">&rdquo;</span>
                </p>
                <footer className="mt-4 text-sm text-white/70">
                  {attribution}
                </footer>
              </blockquote>

              <Link
                href="/chi-siamo/intervista-radio-crociere-fluviali"
                className="mt-6 inline-flex w-fit items-center gap-2 font-semibold text-white transition-all duration-300 hover:gap-3 hover:text-[#C41E2F]"
              >
                Guarda l&rsquo;intervista completa
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
