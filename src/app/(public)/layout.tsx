import TopBar from "@/components/layout/TopBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LoggedInBanner from "@/components/layout/LoggedInBanner";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AdminEditProvider } from "@/components/admin/AdminEditContext";
import { getAuthContext } from "@/lib/supabase/auth";
import { getAgencyByUserId } from "@/lib/supabase/queries/agency-dashboard";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, permissions } = await getAuthContext();

  let displayName: string | undefined;
  if (user && role === "agency") {
    const agency = await getAgencyByUserId(user.id);
    displayName = agency?.business_name ?? undefined;
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
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </AdminEditProvider>
    </AuthProvider>
  );
}
