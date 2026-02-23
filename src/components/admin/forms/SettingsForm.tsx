"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { saveSettings } from "@/app/admin/impostazioni/actions";

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
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            <Label htmlFor="admin_notification_emails">
              Email notifiche admin{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="admin_notification_emails"
              placeholder="info@mishatravel.com"
              rows={2}
              {...register("admin_notification_emails")}
              aria-invalid={!!errors.admin_notification_emails}
            />
            <p className="text-xs text-muted-foreground">
              Indirizzi email che ricevono le notifiche admin (nuove agenzie,
              documenti caricati, ecc.). Separa pi&ugrave; indirizzi con una
              virgola.
            </p>
            {errors.admin_notification_emails && (
              <p className="text-xs text-destructive">
                {errors.admin_notification_emails.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sender_email">
                Email mittente{" "}
                <span className="text-destructive">*</span>
              </Label>
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
              <Label htmlFor="sender_name">
                Nome mittente{" "}
                <span className="text-destructive">*</span>
              </Label>
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

      {/* Messages */}
      {serverError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {serverError}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Impostazioni salvate con successo.
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center gap-3 border-t pt-6">
        <Button type="submit" disabled={isSubmitting}>
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "Salvataggio..." : "Salva Impostazioni"}
        </Button>
      </div>
    </form>
  );
}
