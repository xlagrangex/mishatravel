export const dynamic = "force-dynamic";

import TopBar from "@/components/layout/TopBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LoggedInBanner from "@/components/layout/LoggedInBanner";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AdminEditProvider } from "@/components/admin/AdminEditContext";
import { getAuthContext } from "@/lib/supabase/auth";
import { getAgencyByUserId } from "@/lib/supabase/queries/agency-dashboard";
import { getPublishedDestinations } from "@/lib/supabase/queries/destinations";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ user, role, permissions }, destinations] = await Promise.all([
    getAuthContext(),
    getPublishedDestinations(),
  ]);

  let displayName: string | undefined;
  if (user && role === "agency") {
    const agency = await getAgencyByUserId(user.id);
    displayName = agency?.business_name ?? undefined;
  }

  // Group destinations by macro_area for the mega menu (ordered)
  const AREA_ORDER = [
    "Europa",
    "Medio Oriente",
    "Asia",
    "Asia Centrale",
    "Africa",
    "America Latina",
    "Percorsi Fluviali",
  ];
  const groupedRaw: Record<string, { name: string; slug: string }[]> = {};
  for (const dest of destinations) {
    const area = dest.macro_area ?? "Altro";
    if (!groupedRaw[area]) groupedRaw[area] = [];
    groupedRaw[area].push({ name: dest.name, slug: dest.slug });
  }
  const destinationsByArea: Record<string, { name: string; slug: string }[]> = {};
  for (const area of AREA_ORDER) {
    if (groupedRaw[area]?.length) destinationsByArea[area] = groupedRaw[area];
  }
  // Add any remaining areas not in the predefined order
  for (const area of Object.keys(groupedRaw)) {
    if (!destinationsByArea[area] && groupedRaw[area].length) {
      destinationsByArea[area] = groupedRaw[area];
    }
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
