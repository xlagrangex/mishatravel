import { getRecentActivity } from "@/lib/supabase/queries/activity"
import StoricoTable from "./StoricoTable"

export const metadata = {
  title: "Storico Modifiche | Admin MishaTravel",
}

export default async function StoricoPage() {
  const activity = await getRecentActivity(200)

  return <StoricoTable activity={activity} />
}
