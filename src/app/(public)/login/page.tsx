"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Lock,
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  LogOut,
} from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Inserisci un indirizzo email valido"),
  password: z.string().min(1, "La password è obbligatoria"),
  remember: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, role } = useAuth();
  const redirectTo = searchParams.get("redirect");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const rememberValue = watch("remember");

  function getDashboardUrl() {
    if (role === "agency") return "/agenzia/dashboard";
    if (role === "admin" || role === "super_admin" || role === "operator") return "/admin";
    return "/";
  }

  function getRoleLabel() {
    if (role === "agency") return "Agenzia";
    if (role === "admin" || role === "super_admin") return "Amministratore";
    if (role === "operator") return "Operatore";
    return "Utente";
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  async function onSubmit(formData: LoginFormData) {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        if (authError.message.includes("Email not confirmed")) {
          setError("Account non verificato. Controlla la tua email per il link di conferma.");
        } else if (authError.message.includes("Invalid login credentials")) {
          setError("Credenziali non valide. Controlla email e password.");
        } else {
          setError(authError.message);
        }
        setIsLoading(false);
        return;
      }

      if (!data.user) {
        setError("Errore durante l'accesso. Riprova.");
        setIsLoading(false);
        return;
      }

      if (redirectTo) {
        router.push(redirectTo);
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .single();

      if (roleData) {
        const userRole = roleData.role;
        if (userRole === "agency") {
          const { data: agencyData } = await supabase
            .from("agencies")
            .select("status")
            .eq("user_id", data.user.id)
            .single();

          if (agencyData && agencyData.status !== "active") {
            router.push("/account-in-attesa");
          } else {
            router.push("/agenzia/dashboard");
          }
        } else if (userRole === "admin" || userRole === "super_admin" || userRole === "operator") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else {
        router.push("/");
      }
    } catch {
      setError("Si è verificato un errore imprevisto. Riprova più tardi.");
      setIsLoading(false);
    }
  }

  // Already logged in state
  if (user) {
    return (
      <section className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 bg-gradient-to-br from-stone-100 via-stone-50 to-stone-200 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="container mx-auto px-4 relative z-10">
          <div
            className={`max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-10 text-center transition-all duration-500 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="size-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="size-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-2">
              Sei gia connesso
            </h1>
            <p className="text-gray-500 mb-2">
              Hai effettuato l&apos;accesso come
            </p>
            <p className="font-medium text-[#1B2D4F] mb-1">{user.email}</p>
            <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-[#C41E2F]/10 text-[#C41E2F] mb-8">
              {getRoleLabel()}
            </span>

            <div className="space-y-3">
              <Button
                asChild
                className="w-full bg-[#C41E2F] hover:bg-[#A31825] text-white"
                size="lg"
              >
                <Link href={getDashboardUrl()} className="flex items-center justify-center gap-2">
                  Vai alla tua area
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <LogOut className="size-4" />
                Esci e accedi con un altro account
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 bg-gradient-to-br from-stone-100 via-stone-50 to-stone-200 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
      <div className="container mx-auto px-4 relative z-10">
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-0 max-w-[1000px] mx-auto overflow-hidden rounded-2xl shadow-2xl transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Left - decorative */}
          <div className="relative hidden lg:block min-h-[520px]">
            <Image
              src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop"
              alt="Viaggio"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#1B2D4F]/85 via-[#1B2D4F]/60 to-[#C41E2F]/30 flex items-center justify-center">
              <div className="text-white text-center px-10">
                <div className="size-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-6 border border-white/20">
                  <Lock className="size-7 text-white" />
                </div>
                <h2 className="text-3xl font-bold font-[family-name:var(--font-poppins)] mb-4">
                  Area Riservata
                </h2>
                <p className="text-white/80 leading-relaxed max-w-xs mx-auto">
                  Accedi alla tua area riservata per gestire le prenotazioni,
                  consultare i cataloghi e accedere al portale B2B.
                </p>
              </div>
            </div>
          </div>

          {/* Right - form */}
          <div className="bg-white p-8 lg:p-12 flex flex-col justify-center">
            <div className="max-w-sm mx-auto w-full">
              <h1 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-2">
                Accedi
              </h1>
              <p className="text-gray-500 mb-8">
                Inserisci le tue credenziali per accedere all&apos;area riservata.
              </p>

              {/* Error message */}
              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertCircle className="size-5 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Email
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 group-focus-within:text-[#C41E2F] transition-colors" />
                    <Input
                      type="email"
                      placeholder="email@esempio.com"
                      className="pl-10"
                      {...register("email")}
                      aria-invalid={!!errors.email}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 group-focus-within:text-[#C41E2F] transition-colors z-10" />
                    <PasswordInput
                      placeholder="La tua password"
                      className="pl-10"
                      {...register("password")}
                      aria-invalid={!!errors.password}
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <Checkbox
                      checked={rememberValue}
                      onCheckedChange={(checked) =>
                        setValue("remember", checked === true)
                      }
                    />
                    Ricordami
                  </label>
                  <Link
                    href="/reset"
                    className="text-sm text-[#C41E2F] hover:underline"
                  >
                    Password dimenticata?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#C41E2F] hover:bg-[#A31825] text-white transition-all duration-300 hover:shadow-lg hover:shadow-[#C41E2F]/20"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Accesso in corso...
                    </>
                  ) : (
                    <>
                      Accedi
                      <ArrowRight className="size-4 ml-1" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-500">
                Non hai ancora un account?{" "}
                <Link
                  href="/registrazione"
                  className="text-[#C41E2F] font-medium hover:underline"
                >
                  Registrati
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Wrapper with Suspense boundary for useSearchParams
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <section className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 bg-gradient-to-br from-stone-100 via-stone-50 to-stone-200">
          <div className="container mx-auto px-4">
            <div className="max-w-[1000px] mx-auto text-center">
              <Loader2 className="size-8 animate-spin text-[#C41E2F]/40 mx-auto" />
            </div>
          </div>
        </section>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
