"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { submitComplaint } from "./actions";

const reclamiSchema = z.object({
  nome_cognome: z.string().min(1, "Nome e cognome sono obbligatori"),
  email: z.string().min(1, "L'email è obbligatoria").email("Inserisci un'email valida"),
  telefono: z.string(),
  n_pratica: z.string(),
  destinazione: z.string(),
  date_viaggio: z.string(),
  agenzia: z.string(),
  descrizione: z.string().min(20, "La descrizione deve contenere almeno 20 caratteri"),
  richiesta: z.string(),
  privacy: z.literal(true, {
    error: "Devi accettare la Privacy Policy per inviare il reclamo",
  }),
});

type ReclamiFormData = z.infer<typeof reclamiSchema>;

export default function ReclamiForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReclamiFormData>({
    resolver: zodResolver(reclamiSchema),
    defaultValues: {
      nome_cognome: "",
      email: "",
      telefono: "",
      n_pratica: "",
      destinazione: "",
      date_viaggio: "",
      agenzia: "",
      descrizione: "",
      richiesta: "",
      privacy: undefined as unknown as true,
    },
  });

  const privacyChecked = watch("privacy");

  async function onSubmit(data: ReclamiFormData) {
    setStatus("loading");
    setServerError(null);

    const { error } = await submitComplaint({
      nome_cognome: data.nome_cognome,
      email: data.email,
      telefono: data.telefono || "",
      n_pratica: data.n_pratica || "",
      destinazione: data.destinazione || "",
      date_viaggio: data.date_viaggio || "",
      agenzia: data.agenzia || "",
      descrizione: data.descrizione,
      richiesta: data.richiesta || "",
    });

    if (error) {
      setServerError(error);
      setStatus("error");
    } else {
      setStatus("success");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-gray-50 rounded-lg p-8 border border-gray-100 text-center">
        <CheckCircle2 className="size-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-2">
          Reclamo inviato con successo
        </h3>
        <p className="text-gray-600">
          Riceverai riscontro entro 30 giorni lavorativi.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-6 text-center">
        Modulo Reclami Online
      </h2>

      {serverError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 mb-5 text-red-700 text-sm">
          <AlertCircle className="size-4 shrink-0" />
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Nome e Cognome *</label>
            <Input placeholder="Nome e Cognome del viaggiatore" {...register("nome_cognome")} />
            {errors.nome_cognome && (
              <p className="text-red-500 text-xs mt-1">{errors.nome_cognome.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email *</label>
            <Input type="email" placeholder="email@esempio.com" {...register("email")} />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Telefono</label>
            <Input type="tel" placeholder="+39 ..." {...register("telefono")} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">N. Pratica / Prenotazione</label>
            <Input placeholder="Es. MT-2025-001234" {...register("n_pratica")} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Destinazione</label>
            <Input placeholder="Es. Giordania" {...register("destinazione")} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Date del viaggio</label>
            <Input placeholder="Es. 10/03/2025 - 17/03/2025" {...register("date_viaggio")} />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Agenzia di viaggio (se applicabile)</label>
          <Input placeholder="Nome dell'agenzia" {...register("agenzia")} />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Descrizione del reclamo *</label>
          <Textarea
            placeholder="Descrivi in dettaglio il disservizio riscontrato..."
            rows={6}
            {...register("descrizione")}
          />
          {errors.descrizione && (
            <p className="text-red-500 text-xs mt-1">{errors.descrizione.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Richiesta</label>
          <Textarea
            placeholder="Indica la soluzione che desideri (rimborso, risarcimento, ecc.)"
            rows={3}
            {...register("richiesta")}
          />
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="privacy-reclami"
            checked={privacyChecked === true}
            onCheckedChange={(checked) =>
              setValue("privacy", checked === true ? true : (undefined as never), {
                shouldValidate: true,
              })
            }
            className="mt-0.5"
          />
          <label htmlFor="privacy-reclami" className="text-sm text-gray-600">
            Dichiaro che le informazioni fornite sono veritiere e accetto il trattamento dei dati
            personali ai sensi della{" "}
            <Link href="/privacy-policy" className="text-[#C41E2F] underline">
              Privacy Policy
            </Link>
            . *
          </label>
        </div>
        {errors.privacy && (
          <p className="text-red-500 text-xs -mt-3">{errors.privacy.message}</p>
        )}

        <Button
          type="submit"
          className="w-full bg-[#C41E2F] hover:bg-[#A31825] text-white"
          size="lg"
          disabled={status === "loading"}
        >
          {status === "loading" ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Invio in corso...
            </>
          ) : (
            "Invia Reclamo"
          )}
        </Button>
      </form>
    </div>
  );
}
