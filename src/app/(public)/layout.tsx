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

  // Group destinations by macro_area for the mega menu
  const destinationsByArea: Record<string, { name: string; slug: string }[]> = {};
  for (const dest of destinations) {
    const area = dest.macro_area ?? "Altro";
    if (!destinationsByArea[area]) destinationsByArea[area] = [];
    destinationsByArea[area].push({ name: dest.name, slug: dest.slug });
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
