import {
  getAllStatements,
  getStatementStats,
  getActiveAgenciesForSelect,
} from '@/lib/supabase/queries/admin-statements'
import EstrattiContoClient from './EstrattiContoClient'

export const dynamic = 'force-dynamic'

export default async function EstrattiContoPage() {
  const [statements, stats, agencies] = await Promise.all([
    getAllStatements(),
    getStatementStats(),
    getActiveAgenciesForSelect(),
  ])

  return (
    <EstrattiContoClient
      statements={statements}
      stats={stats}
      agencies={agencies}
    />
  )
}
