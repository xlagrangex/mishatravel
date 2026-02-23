"use client";

import { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, X, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { saveSettings } from "@/app/admin/impostazioni/actions";

// ---------------------------------------------------------------------------
// Email Tags Input
// ---------------------------------------------------------------------------

function EmailTagsInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const emails = value
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addEmail = useCallback(
    (raw: string) => {
      const email = raw.trim();
      if (!email) return;
      // Basic email check
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
      if (emails.includes(email)) return;
      const next = [...emails, email].join(", ");
      onChange(next);
      setInputValue("");
    },
    [emails, onChange]
  );

  const removeEmail = useCallback(
    (index: number) => {
      const next = emails.filter((_, i) => i !== index).join(", ");
      onChange(next || "");
    },
    [emails, onChange]
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addEmail(inputValue);
    }
    if (e.key === "Backspace" && !inputValue && emails.length > 0) {
      removeEmail(emails.length - 1);
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    const parts = pasted.split(/[,;\s]+/).filter(Boolean);
    let current = emails;
    for (const part of parts) {
      const email = part.trim();
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !current.includes(email)) {
        current = [...current, email];
      }
    }
    onChange(current.join(", "));
    setInputValue("");
  }

  return (
    <div
      className="flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 cursor-text min-h-[2.5rem]"
      onClick={() => inputRef.current?.focus()}
    >
      {emails.map((email, i) => (
        <span
          key={`${email}-${i}`}
          className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-sm text-primary"
        >
          {email}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeEmail(i);
            }}
            className="rounded-full p-0.5 hover:bg-primary/20 transition-colors"
            aria-label={`Rimuovi ${email}`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="email"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={() => {
          if (inputValue.trim()) addEmail(inputValue);
        }}
        placeholder={emails.length === 0 ? "Inserisci email e premi Invio" : ""}
        className="flex-1 min-w-[160px] bg-transparent outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Settings Form
// ---------------------------------------------------------------------------

const settingsSchema = z.object({
  admin_notification_emails: z
    .string()
    .min(1, "Almeno un indirizzo email è obbligatorio"),
  sender_email: z.string().email("Email mittente non valida"),
  sender_name: z.string().min(1, "Il nome mittente è obbligatorio"),
  company_phone: z.string(),
  company_address: z.string(),
  company_website: z.string(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

interface SettingsFormProps {
  initialData: Record<string, string>;
}

export default function SettingsForm({ initialData }: SettingsFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      admin_notification_emails:
        initialData.admin_notification_emails ?? "",
      sender_email: initialData.sender_email ?? "",
      sender_name: initialData.sender_name ?? "",
      company_phone: initialData.company_phone ?? "",
      company_address: initialData.company_address ?? "",
      company_website: initialData.company_website ?? "",
    },
  });

  const adminEmails = watch("admin_notification_emails");
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (data: SettingsFormValues) => {
    setServerError(null);
    setSuccess(false);
    const result = await saveSettings(data);
    if (!result.success) {
      setServerError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Success banner */}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          <p className="text-sm font-medium text-green-800">
            Modifiche effettuate correttamente.
          </p>
        </div>
      )}

      {/* Error banner */}
      {serverError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Impostazioni Email</CardTitle>
          <CardDescription>
            Configura gli indirizzi email per le notifiche e le comunicazioni
            del sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email notifiche admin</Label>
            <EmailTagsInput
              value={adminEmails}
              onChange={(val) =>
                setValue("admin_notification_emails", val, {
                  shouldValidate: true,
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              Indirizzi email che ricevono le notifiche admin (nuove agenzie,
              documenti caricati, ecc.). Digita un&apos;email e premi Invio.
            </p>
            {errors.admin_notification_emails && (
              <p className="text-xs text-destructive">
                {errors.admin_notification_emails.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sender_email">Email mittente</Label>
              <Input
                id="sender_email"
                type="email"
                placeholder="noreply@mishatravel.com"
                {...register("sender_email")}
                aria-invalid={!!errors.sender_email}
              />
              <p className="text-xs text-muted-foreground">
                Indirizzo &quot;Da&quot; nelle email inviate dal sistema.
              </p>
              {errors.sender_email && (
                <p className="text-xs text-destructive">
                  {errors.sender_email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sender_name">Nome mittente</Label>
              <Input
                id="sender_name"
                placeholder="MishaTravel"
                {...register("sender_name")}
                aria-invalid={!!errors.sender_name}
              />
              {errors.sender_name && (
                <p className="text-xs text-destructive">
                  {errors.sender_name.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informazioni Azienda</CardTitle>
          <CardDescription>
            Dati aziendali mostrati nel footer delle email e nelle pagine
            pubbliche.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company_phone">Telefono</Label>
            <Input
              id="company_phone"
              placeholder="+39 010 246 1630"
              {...register("company_phone")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_address">Indirizzo</Label>
            <Input
              id="company_address"
              placeholder="Piazza Grimaldi, Genova"
              {...register("company_address")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_website">Sito web</Label>
            <Input
              id="company_website"
              placeholder="https://mishatravel.com"
              {...register("company_website")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "Salvataggio..." : "Salva Impostazioni"}
        </Button>
      </div>
    </form>
  );
}
