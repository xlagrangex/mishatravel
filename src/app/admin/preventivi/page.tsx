import {
  getAllQuotes,
  getQuoteStats,
  getAgenciesForFilter,
} from '@/lib/supabase/queries/admin-quotes'
import AdminQuotesTable from './AdminQuotesTable'

export default async function PreventiviPage() {
  const [quotes, stats, agencies] = await Promise.all([
    getAllQuotes(),
    getQuoteStats(),
    getAgenciesForFilter(),
  ])

  return (
    <AdminQuotesTable quotes={quotes} stats={stats} agencies={agencies} />
  )
}
