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
import { submitPartnerInquiry } from "./actions";

const partnerSchema = z.object({
  nome_cognome: z.string().min(1, "Nome e cognome obbligatorio"),
  agenzia: z.string().min(1, "Nome agenzia obbligatorio"),
  citta: z.string(),
  telefono: z.string(),
  email: z.string().min(1, "L'email è obbligatoria").email("Inserisci un indirizzo email valido"),
  messaggio: z.string().min(10, "Il messaggio deve contenere almeno 10 caratteri"),
  privacy: z.literal(true, { message: "Devi accettare la Privacy Policy" }),
  newsletter_consent: z.boolean(),
});

type PartnerFormData = z.infer<typeof partnerSchema>;

export default function PartnerForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PartnerFormData>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      nome_cognome: "",
      agenzia: "",
      citta: "",
      telefono: "",
      email: "",
      messaggio: "",
      privacy: undefined as unknown as true,
      newsletter_consent: false,
    },
  });

  const privacyChecked = watch("privacy");
  const newsletterChecked = watch("newsletter_consent");

  const onSubmit = async (data: PartnerFormData) => {
    setServerError(null);
    const result = await submitPartnerInquiry({
      nome_cognome: data.nome_cognome,
      agenzia: data.agenzia,
      citta: data.citta,
      telefono: data.telefono,
      email: data.email,
      messaggio: data.messaggio,
      newsletter_consent: data.newsletter_consent,
    });

    if (result.error) {
      setServerError(result.error);
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="size-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-[#1B2D4F] mb-2">
          Richiesta inviata!
        </h3>
        <p className="text-gray-600">
          Ti contatteremo al pi&ugrave; presto.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Nome e Cognome *
          </label>
          <Input placeholder="Nome e Cognome" {...register("nome_cognome")} />
          {errors.nome_cognome && (
            <p className="text-sm text-red-600 mt-1">{errors.nome_cognome.message}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Agenzia *
          </label>
          <Input placeholder="Nome dell'agenzia" {...register("agenzia")} />
          {errors.agenzia && (
            <p className="text-sm text-red-600 mt-1">{errors.agenzia.message}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Citt&agrave;
          </label>
          <Input placeholder="Città" {...register("citta")} />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Telefono
          </label>
          <Input type="tel" placeholder="+39 ..." {...register("telefono")} />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          Email *
        </label>
        <Input type="email" placeholder="email@agenzia.com" {...register("email")} />
        {errors.email && (
          <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
        )}
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          Messaggio *
        </label>
        <Textarea
          placeholder="Raccontaci della tua agenzia..."
          rows={4}
          {...register("messaggio")}
        />
        {errors.messaggio && (
          <p className="text-sm text-red-600 mt-1">{errors.messaggio.message}</p>
        )}
      </div>

      {/* Privacy checkbox */}
      <div className="flex items-start gap-2">
        <Checkbox
          id="privacy-partner"
          checked={privacyChecked === true}
          onCheckedChange={(checked) =>
            setValue("privacy", checked === true ? true : (undefined as never), {
              shouldValidate: true,
            })
          }
          className="mt-0.5"
        />
        <label htmlFor="privacy-partner" className="text-sm text-gray-600">
          Accetto il trattamento dei dati personali secondo la{" "}
          <a href="/privacy-policy" className="text-[#C41E2F] underline">
            Privacy Policy
          </a>
          . *
        </label>
      </div>
      {errors.privacy && (
        <p className="text-sm text-red-600 -mt-3">{errors.privacy.message}</p>
      )}

      {/* Newsletter checkbox */}
      <div className="flex items-start gap-2">
        <Checkbox
          id="newsletter-partner"
          checked={newsletterChecked === true}
          onCheckedChange={(checked) =>
            setValue("newsletter_consent", checked === true)
          }
          className="mt-0.5"
        />
        <label htmlFor="newsletter-partner" className="text-sm text-gray-600">
          Desidero ricevere aggiornamenti e offerte via email
        </label>
      </div>

      {serverError && (
        <div className="flex items-center gap-2 bg-red-50 text-red-700 p-3 rounded-md text-sm">
          <AlertCircle className="size-4 shrink-0" />
          {serverError}
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-[#C41E2F] hover:bg-[#A31825] text-white"
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" />
            Invio in corso...
          </>
        ) : (
          <>
            <CheckCircle2 className="size-4 mr-2" />
            Richiedi un Incontro
          </>
        )}
      </Button>
    </form>
  );
}
