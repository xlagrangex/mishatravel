"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function AccountScadutoPage() {
  const router = useRouter();
  const [deleting, setDeleting] = useState(true);

  useEffect(() => {
    async function cleanup() {
      try {
        // Call a server endpoint to delete the expired account
        await fetch("/api/agency/expire", { method: "POST" });
      } catch {
        // Ignore errors — the account may already be deleted
      }

      // Sign out the user locally
      const supabase = createClient();
      await supabase.auth.signOut();
      setDeleting(false);
    }
    cleanup();
  }, []);

  return (
    <section className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <Card className="max-w-lg mx-auto">
          <CardContent className="flex flex-col items-center text-center p-8 sm:p-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 mb-6">
              <AlertTriangle className="h-8 w-8" />
            </div>

            <h1 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-3">
              Account scaduto
            </h1>

            <p className="text-gray-600 mb-2 leading-relaxed">
              Il tuo account &egrave; stato eliminato perch&eacute; la visura
              camerale non &egrave; stata caricata entro 7 giorni dalla
              registrazione.
            </p>

            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Puoi registrarti nuovamente in qualsiasi momento. Se hai domande,
              contattaci a{" "}
              <a
                href="mailto:info@mishatravel.com"
                className="text-[#C41E2F] hover:underline"
              >
                info@mishatravel.com
              </a>
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button asChild>
                <Link href="/registrazione">
                  <RefreshCw className="h-4 w-4" />
                  Registrati di nuovo
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">
                  <Home className="h-4 w-4" />
                  Torna alla Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
