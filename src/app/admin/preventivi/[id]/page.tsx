import { notFound } from 'next/navigation'
import { getQuoteDetail, getBankingPresets } from '@/lib/supabase/queries/admin-quotes'
import QuoteDetailClient from './QuoteDetailClient'

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>
}

export default async function QuoteDetailPage({ params }: Props) {
  const { id } = await params
  const [quote, bankingPresets] = await Promise.all([
    getQuoteDetail(id),
    getBankingPresets(),
  ])

  if (!quote) {
    notFound()
  }

  return <QuoteDetailClient quote={quote} bankingPresets={bankingPresets} />
}
