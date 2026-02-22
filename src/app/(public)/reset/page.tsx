"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { requestPasswordReset } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Mail,
  Lock,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

// --------------------------------------------------------------------------
// Schemas
// --------------------------------------------------------------------------

const requestSchema = z.object({
  email: z.string().email("Inserisci un indirizzo email valido"),
});

const updateSchema = z
  .object({
    password: z.string().min(8, "La password deve avere almeno 8 caratteri"),
    conferma_password: z.string().min(1, "Conferma la password"),
  })
  .refine((data) => data.password === data.conferma_password, {
    message: "Le password non coincidono",
    path: ["conferma_password"],
  });

type RequestFormData = z.infer<typeof requestSchema>;
type UpdateFormData = z.infer<typeof updateSchema>;

// --------------------------------------------------------------------------
// Request Reset View
// --------------------------------------------------------------------------

function RequestResetView() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(formData: RequestFormData) {
    setIsLoading(true);
    setError(null);

    try {
      const result = await requestPasswordReset(formData.email, window.location.origin);

      if (!result.success) {
        setError(result.error ?? "Errore imprevisto. Riprova più tardi.");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Si è verificato un errore imprevisto. Riprova più tardi.");
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <CheckCircle2 className="size-12 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-3">
          Email inviata!
        </h2>
        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
          Se l&apos;indirizzo email è associato a un account, riceverai un link per
          reimpostare la password. Controlla anche la cartella spam.
        </p>
        <Link href="/login">
          <Button
            variant="outline"
            size="lg"
          >
            Torna al Login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#1B2D4F] mb-6"
      >
        <ArrowLeft className="size-4" />
        Torna al Login
      </Link>

      <h1 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-2">
        Recupera Password
      </h1>
      <p className="text-gray-500 mb-8 text-sm">
        Inserisci l&apos;indirizzo email associato al tuo account. Riceverai un
        link per reimpostare la password.
      </p>

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

        <Button
          type="submit"
          className="w-full bg-[#C41E2F] hover:bg-[#A31825] text-white"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Invio in corso...
            </>
          ) : (
            "Invia Link di Recupero"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Ricordi la password?{" "}
        <Link
          href="/login"
          className="text-[#C41E2F] font-medium hover:underline"
        >
          Accedi
        </Link>
      </p>
    </>
  );
}

// --------------------------------------------------------------------------
// Update Password View (shown after token verification)
// --------------------------------------------------------------------------

function UpdatePasswordView() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateFormData>({
    resolver: zodResolver(updateSchema),
    defaultValues: { password: "", conferma_password: "" },
  });

  async function onSubmit(formData: UpdateFormData) {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (updateError) {
        if (updateError.message.includes("same password")) {
          setError("La nuova password deve essere diversa da quella attuale.");
        } else {
          setError(updateError.message);
        }
        setIsLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Si è verificato un errore imprevisto. Riprova più tardi.");
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <CheckCircle2 className="size-12 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-3">
          Password aggiornata!
        </h2>
        <p className="text-gray-600 text-sm mb-6">
          La tua password è stata reimpostata con successo. Ora puoi accedere con
          le nuove credenziali.
        </p>
        <Link href="/login">
          <Button
            className="bg-[#C41E2F] hover:bg-[#A31825] text-white"
            size="lg"
          >
            Vai al Login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-2">
        Nuova Password
      </h1>
      <p className="text-gray-500 mb-8 text-sm">
        Inserisci la tua nuova password. Deve avere almeno 8 caratteri.
      </p>

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="size-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Nuova Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              type="password"
              placeholder="Minimo 8 caratteri"
              className="pl-10"
              {...register("password")}
              aria-invalid={!!errors.password}
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Conferma Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              type="password"
              placeholder="Ripeti la password"
              className="pl-10"
              {...register("conferma_password")}
              aria-invalid={!!errors.conferma_password}
            />
          </div>
          {errors.conferma_password && (
            <p className="mt-1 text-xs text-red-600">
              {errors.conferma_password.message}
            </p>
          )}
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
              Aggiornamento in corso...
            </>
          ) : (
            "Aggiorna Password"
          )}
        </Button>
      </form>
    </>
  );
}

// --------------------------------------------------------------------------
// Inner component that uses useSearchParams
// --------------------------------------------------------------------------

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  useEffect(() => {
    // When the user arrives from the email link, verify the token_hash
    // to establish a recovery session, then show the password update form.
    if (!tokenHash || type !== "recovery") return;

    let cancelled = false;

    async function verifyToken() {
      setVerifying(true);
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash!,
          type: "recovery",
        });

        if (cancelled) return;

        if (error) {
          console.error("[Password Reset] verifyOtp error:", error.message);
          setVerifyError(
            "Il link di recupero non è valido o è scaduto. Richiedi un nuovo link."
          );
        } else {
          setVerified(true);
        }
      } catch {
        if (!cancelled) {
          setVerifyError("Errore durante la verifica. Riprova più tardi.");
        }
      } finally {
        if (!cancelled) setVerifying(false);
      }
    }

    verifyToken();
    return () => {
      cancelled = true;
    };
  }, [tokenHash, type]);

  // Token verification in progress
  if (tokenHash && type === "recovery" && verifying) {
    return (
      <section className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
            <Loader2 className="size-8 animate-spin text-[#C41E2F] mx-auto mb-4" />
            <p className="text-sm text-gray-600">Verifica in corso...</p>
          </div>
        </div>
      </section>
    );
  }

  // Token verification failed
  if (tokenHash && type === "recovery" && verifyError) {
    return (
      <section className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
            <AlertCircle className="size-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-3">
              Link non valido
            </h2>
            <p className="text-gray-600 text-sm mb-6">{verifyError}</p>
            <Link href="/reset">
              <Button
                className="bg-[#C41E2F] hover:bg-[#A31825] text-white"
                size="lg"
              >
                Richiedi nuovo link
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // Token verified: show password update form
  if (verified) {
    return (
      <section className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
            <UpdatePasswordView />
          </div>
        </div>
      </section>
    );
  }

  // Default: show request reset form
  return (
    <section className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
          <RequestResetView />
        </div>
      </div>
    </section>
  );
}

// --------------------------------------------------------------------------
// Main Page Component (with Suspense boundary for useSearchParams)
// --------------------------------------------------------------------------

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <section className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
              <Loader2 className="size-8 animate-spin text-gray-400 mx-auto" />
            </div>
          </div>
        </section>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  );
}
