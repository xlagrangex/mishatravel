import { notFound } from 'next/navigation'
import { getQuoteDetail } from '@/lib/supabase/queries/admin-quotes'
import QuoteDetailClient from './QuoteDetailClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function QuoteDetailPage({ params }: Props) {
  const { id } = await params
  const quote = await getQuoteDetail(id)

  if (!quote) {
    notFound()
  }

  return <QuoteDetailClient quote={quote} />
}
