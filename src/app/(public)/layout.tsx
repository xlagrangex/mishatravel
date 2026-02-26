export const dynamic = "force-dynamic";

import TopBar from "@/components/layout/TopBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LoggedInBanner from "@/components/layout/LoggedInBanner";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AdminEditProvider } from "@/components/admin/AdminEditContext";
import CookieConsentProvider from "@/components/cookie/CookieConsentProvider";
import { getAuthContext } from "@/lib/supabase/auth";
import { getAgencyByUserId } from "@/lib/supabase/queries/agency-dashboard";
import { getPublishedDestinations, getTourCountsPerDestination } from "@/lib/supabase/queries/destinations";
import { getPublishedMacroAreas, getMegaMenuMode } from "@/lib/supabase/queries/macro-areas";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ user, role, permissions }, destinations, productCounts, macroAreas, megaMenuMode] = await Promise.all([
    getAuthContext(),
    getPublishedDestinations(),
    getTourCountsPerDestination(),
    getPublishedMacroAreas(),
    getMegaMenuMode(),
  ]);

  let displayName: string | undefined;
  if (user && role === "agency") {
    const agency = await getAgencyByUserId(user.id);
    displayName = agency?.business_name ?? undefined;
  }

  // Group destinations by macro_area for the mega menu
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

  const RIVER_AREA = "Percorsi Fluviali";
  let sortedAreas: string[];

  if (megaMenuMode === "manual") {
    // Manual mode: use macro_areas table sort_order, only show published areas
    const maNames = new Set(macroAreas.map((a) => a.name));
    sortedAreas = macroAreas
      .map((a) => a.name)
      .filter((name) => groupedRaw[name]?.length > 0);
    // Include any areas not in the table (like "Altro") at the end
    for (const area of Object.keys(groupedRaw)) {
      if (!maNames.has(area) && groupedRaw[area].length > 0) {
        sortedAreas.push(area);
      }
    }
  } else {
    // Dynamic mode: alphabetical, "Percorsi Fluviali" always last
    sortedAreas = Object.keys(groupedRaw)
      .filter((a) => groupedRaw[a].length > 0)
      .sort((a, b) => {
        if (a === RIVER_AREA) return 1;
        if (b === RIVER_AREA) return -1;
        return a.localeCompare(b, "it");
      });
  }

  const destinationsByArea: Record<string, { name: string; slug: string; hasProducts: boolean }[]> = {};
  for (const area of sortedAreas) {
    destinationsByArea[area] = groupedRaw[area];
  }

  return (
    <AuthProvider user={user} role={role} permissions={permissions}>
      <AdminEditProvider>
        <CookieConsentProvider>
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
        </CookieConsentProvider>
      </AdminEditProvider>
    </AuthProvider>
  );
}
