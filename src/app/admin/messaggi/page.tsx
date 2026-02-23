import { getContactSubmissions } from "@/lib/supabase/queries/contact-submissions";
import MessaggiTable from "./MessaggiTable";

export const dynamic = "force-dynamic";

export default async function MessaggiPage() {
  const submissions = await getContactSubmissions();

  return <MessaggiTable submissions={submissions} />;
}
