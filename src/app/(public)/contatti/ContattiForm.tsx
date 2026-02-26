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
import { submitContactForm } from "./actions";

const contattiSchema = z.object({
  nome: z.string().min(1, "Il nome \u00e8 obbligatorio"),
  cognome: z.string().min(1, "Il cognome \u00e8 obbligatorio"),
  email: z.string().min(1, "L'email \u00e8 obbligatoria").email("Inserisci un'email valida"),
  telefono: z.string().default(""),
  oggetto: z.string().min(1, "L'oggetto \u00e8 obbligatorio"),
  messaggio: z.string().min(10, "Il messaggio deve contenere almeno 10 caratteri"),
  privacy: z.literal(true, { message: "Devi accettare la Privacy Policy" }),
  newsletter_consent: z.boolean().default(false),
});

type ContattiFormData = z.infer<typeof contattiSchema>;

export default function ContattiForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<ContattiFormData>({
    resolver: zodResolver(contattiSchema) as any,
    defaultValues: {
      nome: "",
      cognome: "",
      email: "",
      telefono: "",
      oggetto: "",
      messaggio: "",
      privacy: undefined as unknown as true,
      newsletter_consent: false,
    },
  });

  const privacyChecked = watch("privacy");
  const newsletterChecked = watch("newsletter_consent");

  async function onSubmit(data: ContattiFormData) {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const result = await submitContactForm({
      nome: data.nome,
      cognome: data.cognome,
      email: data.email,
      telefono: data.telefono,
      oggetto: data.oggetto,
      messaggio: data.messaggio,
      newsletter_consent: data.newsletter_consent ?? false,
    });

    setIsLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      window.umami?.track("contact_form_submitted");
      reset();
    }
  }

  if (success) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 border border-gray-100">
        <div className="flex flex-col items-center text-center gap-4 py-8">
          <CheckCircle2 className="size-12 text-green-600" />
          <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)]">
            Messaggio Inviato!
          </h2>
          <p className="text-green-700 text-lg">
            Messaggio inviato con successo! Ti risponderemo al pi&ugrave; presto.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => setSuccess(false)}
          >
            Invia un altro messaggio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-6">
        Scrivici un Messaggio
      </h2>

      {error && (
        <div className="mb-5 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
          <AlertCircle className="size-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Nome *</label>
            <Input placeholder="Il tuo nome" {...register("nome")} />
            {errors.nome && (
              <p className="text-xs text-red-600 mt-1">{errors.nome.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Cognome *</label>
            <Input placeholder="Il tuo cognome" {...register("cognome")} />
            {errors.cognome && (
              <p className="text-xs text-red-600 mt-1">{errors.cognome.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Email *</label>
          <Input type="email" placeholder="email@esempio.com" {...register("email")} />
          {errors.email && (
            <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Telefono</label>
          <Input type="tel" placeholder="+39 010 ..." {...register("telefono")} />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Oggetto *</label>
          <Input placeholder="Informazioni su un viaggio" {...register("oggetto")} />
          {errors.oggetto && (
            <p className="text-xs text-red-600 mt-1">{errors.oggetto.message}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Messaggio *</label>
          <Textarea
            placeholder="Scrivi il tuo messaggio..."
            rows={5}
            {...register("messaggio")}
          />
          {errors.messaggio && (
            <p className="text-xs text-red-600 mt-1">{errors.messaggio.message}</p>
          )}
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="privacy"
            checked={privacyChecked === true}
            onCheckedChange={(checked) =>
              setValue("privacy", checked === true ? true : (undefined as never), {
                shouldValidate: true,
              })
            }
            className="mt-0.5"
          />
          <label htmlFor="privacy" className="text-sm text-gray-600 cursor-pointer">
            Ho letto e accetto la{" "}
            <a href="/privacy-policy" className="text-[#C41E2F] underline">
              Privacy Policy
            </a>{" "}
            e autorizzo il trattamento dei miei dati personali. *
          </label>
        </div>
        {errors.privacy && (
          <p className="text-xs text-red-600 -mt-3">{errors.privacy.message}</p>
        )}

        <div className="flex items-start gap-2">
          <Checkbox
            id="newsletter"
            checked={newsletterChecked === true}
            onCheckedChange={(checked) =>
              setValue("newsletter_consent", checked === true)
            }
            className="mt-0.5"
          />
          <label htmlFor="newsletter" className="text-sm text-gray-600 cursor-pointer">
            Desidero ricevere aggiornamenti e offerte via email
          </label>
        </div>

        <Button
          type="submit"
          className="w-full bg-[#C41E2F] hover:bg-[#A31825] text-white"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              Invio in corso...
            </>
          ) : (
            "Invia Messaggio"
          )}
        </Button>
      </form>
    </div>
  );
}
