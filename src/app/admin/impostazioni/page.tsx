import { getSettingsMap } from "@/lib/supabase/queries/settings";
import { getAuthContext } from "@/lib/supabase/auth";
import { redirect } from "next/navigation";
import SettingsForm from "@/components/admin/forms/SettingsForm";

export const dynamic = "force-dynamic";

export default async function ImpostazioniPage() {
  const { role } = await getAuthContext();
  if (role !== "super_admin") {
    redirect("/admin?error=no_permission");
  }

  const settings = await getSettingsMap();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-poppins)] text-2xl font-bold">
          Impostazioni
        </h1>
        <p className="text-muted-foreground">
          Configura le impostazioni globali del sito.
        </p>
      </div>
      <SettingsForm initialData={settings} />
    </div>
  );
}
