import Link from 'next/link'
import {
  Map,
  Ship,
  Globe,
  Calendar,
  BookOpen,
  Phone,
  ArrowLeft,
  Compass,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const QUICK_LINKS = [
  { label: 'Tour', href: '/tours', icon: Map, desc: 'Scopri i nostri itinerari' },
  { label: 'Crociere Fluviali', href: '/crociere', icon: Ship, desc: 'Naviga lungo i fiumi' },
  { label: 'Destinazioni', href: '/destinazioni', icon: Globe, desc: 'Esplora le mete' },
  { label: 'Calendario Partenze', href: '/calendario-partenze', icon: Calendar, desc: 'Trova la data ideale' },
  { label: 'Cataloghi', href: '/cataloghi', icon: BookOpen, desc: 'Sfoglia le brochure' },
  { label: 'Contatti', href: '/contatti', icon: Phone, desc: 'Parla con noi' },
]

export default function NotFound() {
  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4 text-center">
        {/* Big 404 */}
        <p className="font-[family-name:var(--font-poppins)] text-[8rem] font-bold leading-none text-[#C41E2F]/15 sm:text-[10rem]">
          404
        </p>
        <div className="-mt-10 space-y-3 sm:-mt-14">
          <h1 className="font-[family-name:var(--font-poppins)] text-2xl font-bold text-[#1B2D4F] sm:text-3xl">
            Ops! Questa pagina non esiste
          </h1>
          <p className="mx-auto max-w-md text-gray-500">
            La pagina che stai cercando potrebbe essere stata rimossa, rinominata
            oppure l&apos;indirizzo non è corretto.
          </p>
        </div>

        {/* Divider */}
        <div className="mx-auto my-8 h-[3px] w-[60px] bg-[#C41E2F]" />

        {/* Quick links grid */}
        <div className="mx-auto max-w-3xl">
          <p className="mb-6 text-sm font-medium uppercase tracking-wider text-gray-400">
            Forse stavi cercando
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex flex-col items-center gap-2 rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-5 transition-all hover:-translate-y-1 hover:border-[#C41E2F]/20 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1B2D4F]/5 transition-colors group-hover:bg-[#C41E2F]/10">
                  <link.icon className="h-5 w-5 text-[#1B2D4F] transition-colors group-hover:text-[#C41E2F]" />
                </div>
                <span className="text-sm font-semibold text-[#1B2D4F]">
                  {link.label}
                </span>
                <span className="text-xs text-gray-400">
                  {link.desc}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA buttons */}
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna alla Homepage
            </Link>
          </Button>
          <Button variant="secondary" size="lg" asChild>
            <Link href="/tours">
              <Compass className="mr-2 h-4 w-4" />
              Esplora i Tour
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
