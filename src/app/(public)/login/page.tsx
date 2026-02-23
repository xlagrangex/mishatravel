"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock, Mail, Loader2, AlertCircle } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Inserisci un indirizzo email valido"),
  password: z.string().min(1, "La password è obbligatoria"),
  remember: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      // If there is a redirect parameter, use it
      if (redirectTo) {
        router.push(redirectTo);
        return;
      }

      // Otherwise, redirect based on role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .single();

      if (roleData) {
        const role = roleData.role;
        if (role === "agency") {
          // Check if agency is active before redirecting to dashboard
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
        } else if (role === "admin" || role === "super_admin" || role === "operator") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else {
        // No role assigned yet
        router.push("/");
      }
    } catch {
      setError("Si è verificato un errore imprevisto. Riprova più tardi.");
      setIsLoading(false);
    }
  }

  return (
    <section className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 bg-[#1B2D4F] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 max-w-5xl mx-auto overflow-hidden rounded-xl shadow-2xl">
          {/* Left - decorative */}
          <div className="relative hidden lg:block min-h-[500px]">
            <Image
              src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop"
              alt="Viaggio"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1B2D4F]/80 to-[#1B2D4F]/50 flex items-center justify-center">
              <div className="text-white text-center px-8">
                <h2 className="text-3xl font-bold font-[family-name:var(--font-poppins)] mb-4">
                  Area Riservata
                </h2>
                <p className="text-white/80 leading-relaxed">
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
                <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle className="size-5 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
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
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
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
                  className="w-full bg-[#C41E2F] hover:bg-[#A31825] text-white"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Accesso in corso...
                    </>
                  ) : (
                    "Accedi"
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
        <section className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 bg-[#1B2D4F]">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto text-center">
              <Loader2 className="size-8 animate-spin text-white/40 mx-auto" />
            </div>
          </div>
        </section>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
