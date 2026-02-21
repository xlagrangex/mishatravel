"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LogIn, FileText, ShieldCheck } from "lucide-react";
import type { User } from "@supabase/supabase-js";

type UserRole = "agency" | "admin" | "super_admin" | "operator" | null;

export default function LoginCTA() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        if (!currentUser) {
          setUser(null);
          setRole(null);
          setLoading(false);
          return;
        }

        setUser(currentUser);

        // Fetch role
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", currentUser.id)
          .single();

        if (roleData) {
          setRole(roleData.role as UserRole);
        }
      } catch {
        // Silently handle errors - treat as not authenticated
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  // Loading state - show nothing to avoid flash
  if (loading) {
    return null;
  }

  // Admin/super_admin/operator - show admin badge
  if (
    user &&
    (role === "admin" || role === "super_admin" || role === "operator")
  ) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="flex items-center gap-3 py-4">
          <ShieldCheck className="size-5 text-blue-600 shrink-0" />
          <p className="text-sm text-blue-700">
            Sei autenticato come amministratore.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Logged in as agency - show quote button (disabled for now)
  if (user && role === "agency") {
    return (
      <Card className="border-[#C41E2F]/20 bg-red-50/50">
        <CardContent className="py-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    className="w-full bg-[#C41E2F] hover:bg-[#A31825] text-white"
                    size="lg"
                    disabled
                  >
                    <FileText className="size-4" />
                    Richiedi Preventivo
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Configuratore preventivi in arrivo</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardContent>
      </Card>
    );
  }

  // Not logged in - show login CTA
  return (
    <Card className="border-gray-200 bg-gray-50">
      <CardContent className="py-5 text-center space-y-3">
        <p className="text-sm text-gray-600 font-medium">
          Accedi per richiedere un preventivo
        </p>
        <Link href="/login">
          <Button
            className="w-full bg-[#C41E2F] hover:bg-[#A31825] text-white"
            size="lg"
          >
            <LogIn className="size-4" />
            Accedi
          </Button>
        </Link>
        <p className="text-xs text-gray-500">
          Non hai un account?{" "}
          <Link
            href="/registrazione"
            className="text-[#C41E2F] hover:underline"
          >
            Registrati
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
