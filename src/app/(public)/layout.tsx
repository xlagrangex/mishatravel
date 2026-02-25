export const dynamic = "force-dynamic";

import TopBar from "@/components/layout/TopBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LoggedInBanner from "@/components/layout/LoggedInBanner";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AdminEditProvider } from "@/components/admin/AdminEditContext";
import { getAuthContext } from "@/lib/supabase/auth";
import { getAgencyByUserId } from "@/lib/supabase/queries/agency-dashboard";
import { getPublishedDestinations, getTourCountsPerDestination } from "@/lib/supabase/queries/destinations";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ user, role, permissions }, destinations, productCounts] = await Promise.all([
    getAuthContext(),
    getPublishedDestinations(),
    getTourCountsPerDestination(),
  ]);

  let displayName: string | undefined;
  if (user && role === "agency") {
    const agency = await getAgencyByUserId(user.id);
    displayName = agency?.business_name ?? undefined;
  }

  // Group destinations by macro_area for the mega menu (fully dynamic)
  const groupedRaw: Record<string, { name: string; slug: string; hasProducts: boolean }[]> = {};
  for (const dest of destinations) {
    const area = dest.macro_area ?? "Altro";
    if (!groupedRaw[area]) groupedRaw[area] = [];
    groupedRaw[area].push({
      name: dest.name,
      slug: dest.slug,
      hasProducts: (productCounts[dest.slug] ?? 0) > 0,
    });
  }
  // Sort areas alphabetically, but keep "Percorsi Fluviali" always last
  const RIVER_AREA = "Percorsi Fluviali";
  const sortedAreas = Object.keys(groupedRaw)
    .filter((a) => groupedRaw[a].length > 0)
    .sort((a, b) => {
      if (a === RIVER_AREA) return 1;
      if (b === RIVER_AREA) return -1;
      return a.localeCompare(b, "it");
    });
  const destinationsByArea: Record<string, { name: string; slug: string; hasProducts: boolean }[]> = {};
  for (const area of sortedAreas) {
    destinationsByArea[area] = groupedRaw[area];
  }

  return (
    <AuthProvider user={user} role={role} permissions={permissions}>
      <AdminEditProvider>
        {user && role && (
          <LoggedInBanner
            role={role}
            email={user.email ?? ""}
            displayName={displayName}
          />
        )}
        <TopBar />
        <Header destinationsByArea={destinationsByArea} />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </AdminEditProvider>
    </AuthProvider>
  );
}
