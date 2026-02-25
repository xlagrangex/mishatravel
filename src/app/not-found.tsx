import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <p className="font-[family-name:var(--font-poppins)] text-[8rem] font-bold leading-none text-[#C41E2F]/15 sm:text-[10rem]">
        404
      </p>
      <div className="-mt-10 space-y-3 sm:-mt-14">
        <h1 className="font-[family-name:var(--font-poppins)] text-2xl font-bold text-[#1B2D4F] sm:text-3xl">
          Pagina non trovata
        </h1>
        <p className="mx-auto max-w-sm text-gray-500">
          La pagina che stai cercando non esiste o è stata spostata.
        </p>
      </div>
      <div className="mt-8">
        <Button size="lg" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna alla Homepage
          </Link>
        </Button>
      </div>
    </div>
  )
}
