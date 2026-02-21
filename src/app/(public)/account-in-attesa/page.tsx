"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, Home, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function AccountInAttesaPage() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <section className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <Card className="max-w-lg mx-auto">
          <CardContent className="flex flex-col items-center text-center p-8 sm:p-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 mb-6">
              <Clock className="h-8 w-8" />
            </div>

            <h1 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-3">
              Account in fase di revisione
            </h1>

            <p className="text-gray-600 mb-2 leading-relaxed">
              Il tuo account &egrave; in fase di revisione. Riceverai una notifica
              quando sar&agrave; approvato.
            </p>

            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Il nostro team sta verificando i dati della tua agenzia. Questo
              processo richiede generalmente 1-2 giorni lavorativi. Se hai
              domande, contattaci a{" "}
              <a
                href="mailto:info@mishatravel.com"
                className="text-[#C41E2F] hover:underline"
              >
                info@mishatravel.com
              </a>
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button variant="outline" asChild>
                <Link href="/">
                  <Home className="h-4 w-4" />
                  Torna alla Home
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Esci
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
