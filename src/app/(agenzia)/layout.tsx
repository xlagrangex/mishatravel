import type { Metadata } from "next";
import AgenziaShell from "@/components/agenzia/AgenziaShell";
import { getCurrentUser } from "@/lib/supabase/auth";
import {
  getAgencyByUserId,
  getUnreadNotificationCount,
} from "@/lib/supabase/queries/agency-dashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Area Agenzia - MishaTravel",
  robots: "noindex, nofollow",
};

export default async function AgenziaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch agency info for the shell (name in header, unread badge)
  const user = await getCurrentUser();
  let agencyName = "Agenzia";
  let unreadCount = 0;

  if (user) {
    const [agency, unread] = await Promise.all([
      getAgencyByUserId(user.id),
      getUnreadNotificationCount(user.id),
    ]);
    if (agency) agencyName = agency.business_name;
    unreadCount = unread;
  }

  return (
    <AgenziaShell agencyName={agencyName} unreadCount={unreadCount}>
      {children}
    </AgenziaShell>
  );
}
