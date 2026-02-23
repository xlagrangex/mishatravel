"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { registerAgency } from "./actions";
import PageHero from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Building2,
  User,
  Lock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

// --------------------------------------------------------------------------
// Zod schemas for each step
// --------------------------------------------------------------------------

const step1Schema = z.object({
  ragione_sociale: z.string().min(1, "La ragione sociale è obbligatoria"),
  partita_iva: z.string().optional(),
  codice_fiscale: z.string().optional(),
  indirizzo: z.string().optional(),
  citta: z.string().optional(),
  cap: z.string().optional(),
  provincia: z.string().optional(),
  licenza: z.string().optional(),
});

const step2Schema = z.object({
  nome_referente: z.string().optional(),
  email: z.string().email("Inserisci un indirizzo email valido"),
  telefono: z.string().optional(),
  sito_web: z.string().optional(),
});

const step3Schema = z
  .object({
    password: z.string().min(8, "La password deve avere almeno 8 caratteri"),
    conferma_password: z.string().min(1, "Conferma la password"),
    accetta_termini: z.boolean(),
    newsletter_consent: z.boolean().optional(),
  })
  .refine((data) => data.password === data.conferma_password, {
    message: "Le password non coincidono",
    path: ["conferma_password"],
  })
  .refine((data) => data.accetta_termini === true, {
    message: "Devi accettare i termini e condizioni",
    path: ["accetta_termini"],
  });

// Full combined type for the entire form
const fullSchema = step1Schema.merge(step2Schema).and(
  z
    .object({
      password: z.string().min(8),
      conferma_password: z.string().min(1),
      accetta_termini: z.boolean(),
      newsletter_consent: z.boolean().optional(),
    })
    .refine((d) => d.password === d.conferma_password, {
      message: "Le password non coincidono",
      path: ["conferma_password"],
    })
    .refine((d) => d.accetta_termini === true, {
      message: "Devi accettare i termini",
      path: ["accetta_termini"],
    })
);

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;
type FullFormData = z.infer<typeof fullSchema>;

// --------------------------------------------------------------------------
// Step indicator component
// --------------------------------------------------------------------------

function StepIndicator({ current }: { current: number }) {
  const steps = [
    { num: 1, label: "Dati Aziendali", icon: Building2 },
    { num: 2, label: "Contatto", icon: User },
    { num: 3, label: "Password", icon: Lock },
  ];

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isActive = current === step.num;
        const isComplete = current > step.num;

        return (
          <div key={step.num} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  isActive
                    ? "border-[#C41E2F] bg-[#C41E2F] text-white"
                    : isComplete
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-gray-300 bg-white text-gray-400"
                }`}
              >
                {isComplete ? (
                  <CheckCircle2 className="size-5" />
                ) : (
                  <Icon className="size-5" />
                )}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  isActive
                    ? "text-[#C41E2F]"
                    : isComplete
                    ? "text-green-600"
                    : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`w-12 h-0.5 mb-5 sm:mb-0 ${
                  isComplete ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// --------------------------------------------------------------------------
// Main Registration Page
// --------------------------------------------------------------------------

export default function RegistrazionePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Accumulate data across steps
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null);

  // Step 1 form
  const form1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      ragione_sociale: "",
      partita_iva: "",
      codice_fiscale: "",
      indirizzo: "",
      citta: "",
      cap: "",
      provincia: "",
      licenza: "",
    },
  });

  // Step 2 form
  const form2 = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      nome_referente: "",
      email: "",
      telefono: "",
      sito_web: "",
    },
  });

  // Step 3 form
  const form3 = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      password: "",
      conferma_password: "",
      accetta_termini: false,
      newsletter_consent: false,
    },
  });

  function handleStep1Next(data: Step1Data) {
    setStep1Data(data);
    setCurrentStep(2);
  }

  function handleStep2Next(data: Step2Data) {
    setStep2Data(data);
    setCurrentStep(3);
  }

  async function handleStep3Submit(data: Step3Data) {
    if (!step1Data || !step2Data) return;

    setIsLoading(true);
    setError(null);

    try {
      // Everything is handled server-side to avoid Supabase default emails
      const result = await registerAgency(
        {
          business_name: step1Data.ragione_sociale,
          vat_number: step1Data.partita_iva || null,
          fiscal_code: step1Data.codice_fiscale || null,
          license_number: step1Data.licenza || null,
          address: step1Data.indirizzo || null,
          city: step1Data.citta || null,
          zip_code: step1Data.cap || null,
          province: step1Data.provincia || null,
          contact_name: step2Data.nome_referente || null,
          phone: step2Data.telefono || null,
          email: step2Data.email,
          website: step2Data.sito_web || null,
          newsletter_consent: data.newsletter_consent ?? false,
          password: data.password,
        },
        window.location.origin
      );

      if (!result.success) {
        setError(result.error ?? "Errore durante la registrazione. Riprova.");
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

  // --------------------------------------------------------------------------
  // Success view
  // --------------------------------------------------------------------------

  if (success) {
    return (
      <>
        <PageHero
          title="Registrazione Completata"
          subtitle="Il tuo account è stato creato con successo"
          backgroundImage="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1600&h=600&fit=crop"
          breadcrumbs={[{ label: "Registrazione", href: "/registrazione" }]}
        />
        <section className="py-16 bg-white">
          <div className="mx-auto px-4 max-w-[1000px] text-center">
            <div className="bg-green-50 rounded-xl border border-green-200 p-8">
              <CheckCircle2 className="size-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-3">
                Registrazione completata!
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Controlla la tua email per verificare l&apos;account. Dopo la
                verifica, il nostro team valuterà la tua richiesta e riceverai
                una conferma entro 48 ore lavorative.
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
          </div>
        </section>
      </>
    );
  }

  // --------------------------------------------------------------------------
  // Form view
  // --------------------------------------------------------------------------

  return (
    <>
      <PageHero
        title="Registrazione Agenzia"
        subtitle="Crea il tuo account per accedere al portale B2B"
        backgroundImage="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1600&h=600&fit=crop"
        breadcrumbs={[{ label: "Registrazione", href: "/registrazione" }]}
      />

      <section className="py-12 bg-white">
        <div className="mx-auto px-4 max-w-[1000px]">
          <div className="bg-gray-50 rounded-lg p-8 border border-gray-100">
            <StepIndicator current={currentStep} />

            {/* Error message */}
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle className="size-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {/* ============================================= */}
            {/* Step 1 - Dati Aziendali                       */}
            {/* ============================================= */}
            {currentStep === 1 && (
              <form
                onSubmit={form1.handleSubmit(handleStep1Next)}
                className="space-y-5"
              >
                <h3 className="text-lg font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] border-b pb-2">
                  Dati Aziendali
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Ragione Sociale *
                    </label>
                    <Input
                      placeholder="Nome Agenzia Srl"
                      {...form1.register("ragione_sociale")}
                      aria-invalid={!!form1.formState.errors.ragione_sociale}
                    />
                    {form1.formState.errors.ragione_sociale && (
                      <p className="mt-1 text-xs text-red-600">
                        {form1.formState.errors.ragione_sociale.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      P.IVA
                    </label>
                    <Input
                      placeholder="IT01234567890"
                      {...form1.register("partita_iva")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Codice Fiscale
                    </label>
                    <Input
                      placeholder="Codice Fiscale"
                      {...form1.register("codice_fiscale")}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Licenza N.
                    </label>
                    <Input
                      placeholder="Numero licenza"
                      {...form1.register("licenza")}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Indirizzo
                  </label>
                  <Input
                    placeholder="Via, numero civico"
                    {...form1.register("indirizzo")}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Città
                    </label>
                    <Input
                      placeholder="Roma"
                      {...form1.register("citta")}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Provincia
                    </label>
                    <Input
                      placeholder="RM"
                      {...form1.register("provincia")}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      CAP
                    </label>
                    <Input
                      placeholder="00100"
                      {...form1.register("cap")}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    className="bg-[#C41E2F] hover:bg-[#A31825] text-white"
                    size="lg"
                  >
                    Avanti
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </form>
            )}

            {/* ============================================= */}
            {/* Step 2 - Contatto                             */}
            {/* ============================================= */}
            {currentStep === 2 && (
              <form
                onSubmit={form2.handleSubmit(handleStep2Next)}
                className="space-y-5"
              >
                <h3 className="text-lg font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] border-b pb-2">
                  Dati Referente
                </h3>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Nome Referente
                  </label>
                  <Input
                    placeholder="Nome e Cognome"
                    {...form2.register("nome_referente")}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Email *
                  </label>
                  <Input
                    type="email"
                    placeholder="email@agenzia.com"
                    {...form2.register("email")}
                    aria-invalid={!!form2.formState.errors.email}
                  />
                  {form2.formState.errors.email && (
                    <p className="mt-1 text-xs text-red-600">
                      {form2.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Telefono
                    </label>
                    <Input
                      type="tel"
                      placeholder="+39 06 1234567"
                      {...form2.register("telefono")}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Sito Web
                    </label>
                    <Input
                      placeholder="https://www.agenzia.it"
                      {...form2.register("sito_web")}
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setCurrentStep(1)}
                  >
                    <ChevronLeft className="size-4" />
                    Indietro
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#C41E2F] hover:bg-[#A31825] text-white"
                    size="lg"
                  >
                    Avanti
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </form>
            )}

            {/* ============================================= */}
            {/* Step 3 - Password                             */}
            {/* ============================================= */}
            {currentStep === 3 && (
              <form
                onSubmit={form3.handleSubmit(handleStep3Submit)}
                className="space-y-5"
              >
                <h3 className="text-lg font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] border-b pb-2">
                  Credenziali di Accesso
                </h3>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Password *
                  </label>
                  <PasswordInput
                    placeholder="Minimo 8 caratteri"
                    {...form3.register("password")}
                    aria-invalid={!!form3.formState.errors.password}
                  />
                  {form3.formState.errors.password && (
                    <p className="mt-1 text-xs text-red-600">
                      {form3.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Conferma Password *
                  </label>
                  <PasswordInput
                    placeholder="Ripeti la password"
                    {...form3.register("conferma_password")}
                    aria-invalid={!!form3.formState.errors.conferma_password}
                  />
                  {form3.formState.errors.conferma_password && (
                    <p className="mt-1 text-xs text-red-600">
                      {form3.formState.errors.conferma_password.message}
                    </p>
                  )}
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <Checkbox
                    checked={form3.watch("accetta_termini")}
                    onCheckedChange={(checked) =>
                      form3.setValue("accetta_termini", checked === true, {
                        shouldValidate: true,
                      })
                    }
                    className="mt-0.5"
                  />
                  <label className="text-sm text-gray-600 leading-relaxed">
                    Accetto il trattamento dei dati personali secondo la{" "}
                    <Link
                      href="/privacy-policy"
                      className="text-[#C41E2F] underline"
                    >
                      Privacy Policy
                    </Link>{" "}
                    e i{" "}
                    <Link
                      href="/termini-condizioni"
                      className="text-[#C41E2F] underline"
                    >
                      Termini e Condizioni
                    </Link>
                    . *
                  </label>
                </div>
                {form3.formState.errors.accetta_termini && (
                  <p className="text-xs text-red-600">
                    {form3.formState.errors.accetta_termini.message}
                  </p>
                )}

                <div className="flex items-start gap-3 pt-1">
                  <Checkbox
                    checked={form3.watch("newsletter_consent")}
                    onCheckedChange={(checked) =>
                      form3.setValue("newsletter_consent", checked === true)
                    }
                    className="mt-0.5"
                  />
                  <label className="text-sm text-gray-600 leading-relaxed">
                    Desidero ricevere la newsletter e comunicazioni commerciali
                    da Misha Travel.
                  </label>
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setCurrentStep(2)}
                    disabled={isLoading}
                  >
                    <ChevronLeft className="size-4" />
                    Indietro
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#C41E2F] hover:bg-[#A31825] text-white"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Registrazione in corso...
                      </>
                    ) : (
                      "Invia Richiesta di Registrazione"
                    )}
                  </Button>
                </div>
              </form>
            )}

            <p className="mt-6 text-center text-sm text-gray-500">
              Hai già un account?{" "}
              <Link
                href="/login"
                className="text-[#C41E2F] font-medium hover:underline"
              >
                Accedi
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
