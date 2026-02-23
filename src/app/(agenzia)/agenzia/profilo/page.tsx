import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "./ProfileForm";
import { PasswordForm } from "./PasswordForm";
import { DocumentsCard } from "./DocumentsCard";
import type { Agency, AgencyDocument } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getAgencyProfile(): Promise<{
  agency: Agency | null;
  email: string | null;
  documents: AgencyDocument[];
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { agency: null, email: null, documents: [] };

  const { data: agency } = await supabase
    .from("agencies")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!agency) return { agency: null, email: user.email ?? null, documents: [] };

  const { data: documents } = await supabase
    .from("agency_documents")
    .select("*")
    .eq("agency_id", agency.id)
    .order("uploaded_at", { ascending: false });

  return {
    agency: agency as Agency,
    email: user.email ?? null,
    documents: (documents ?? []) as AgencyDocument[],
  };
}

export default async function ProfiloPage() {
  const { agency, email, documents } = await getAgencyProfile();

  if (!agency) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-secondary">
          Profilo Agenzia
        </h1>
        <p className="text-sm text-muted-foreground">
          Gestisci i dati della tua agenzia e le credenziali di accesso.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Agency data form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5" />
                Dati Aziendali
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileForm agency={agency} />
            </CardContent>
          </Card>
        </div>

        {/* Password change + Documents */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cambio Password</CardTitle>
            </CardHeader>
            <CardContent>
              <PasswordForm email={email} />
            </CardContent>
          </Card>

          <DocumentsCard agencyId={agency.id} documents={documents} />
        </div>
      </div>
    </div>
  );
}
