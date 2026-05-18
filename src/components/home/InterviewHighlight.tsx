import Link from "next/link";
import Image from "next/image";
import { Radio, ArrowRight } from "lucide-react";
import SectionReveal from "@/components/home/SectionReveal";

export default function InterviewHighlight() {
  return (
    <section className="relative overflow-hidden bg-[#1B2D4F] py-20 md:py-24">
      {/* decorative bg */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 30%, white 1px, transparent 1px)",
          backgroundSize: "60px 60px, 80px 80px",
        }}
      />

      <div className="container relative mx-auto px-4">
        <SectionReveal>
          <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14 lg:gap-20">
            {/* Video thumbnail */}
            <Link
              href="/chi-siamo/intervista-radio-crociere-fluviali"
              className="group relative block aspect-video overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10"
              aria-label="Guarda l'intervista a MishaTravel su Storytime"
            >
              <Image
                src="https://i.ytimg.com/vi/uT8C58QECZw/maxresdefault.jpg"
                alt="Alessia Cardone di MishaTravel intervistata a Storytime su Evoluzione Radio"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#C41E2F] shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:bg-white md:h-20 md:w-20">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="ml-1 size-7 text-white transition-colors duration-300 group-hover:text-[#C41E2F] md:size-9"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/90">
                <Radio className="size-3.5" />
                Storytime · Evoluzione Radio
              </div>
            </Link>

            {/* Content */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/90 backdrop-blur-sm">
                <Radio className="size-3.5" />
                Ci hanno raccontato in radio
              </span>

              <blockquote className="mt-6">
                <p className="font-[family-name:var(--font-poppins)] text-2xl font-bold leading-tight text-white md:text-3xl lg:text-4xl">
                  <span className="text-[#C41E2F]">&ldquo;</span>
                  Un nuovo modo per vedere l&rsquo;Europa sotto un altro punto di vista.
                  <span className="text-[#C41E2F]">&rdquo;</span>
                </p>
                <footer className="mt-5 text-sm font-medium text-white/70">
                  Alessia Cardone &mdash; MishaTravel
                </footer>
              </blockquote>

              <p className="mt-6 max-w-md text-base leading-relaxed text-white/80">
                Crociere fluviali, viaggi di gruppo e il valore di affidarsi a chi
                conosce davvero le destinazioni: la nostra intervista a Storytime.
              </p>

              <Link
                href="/chi-siamo/intervista-radio-crociere-fluviali"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#C41E2F] px-7 py-3.5 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-[#1B2D4F] hover:shadow-xl"
              >
                Guarda l&rsquo;intervista
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
