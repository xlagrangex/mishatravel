"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateAgencyProfile } from "./actions";
import type { Agency } from "@/lib/types";

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------

const profileSchema = z.object({
  business_name: z.string().min(1, "Ragione sociale obbligatoria"),
  vat_number: z.string().nullable().optional(),
  fiscal_code: z.string().nullable().optional(),
  license_number: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  zip_code: z.string().nullable().optional(),
  province: z.string().nullable().optional(),
  contact_name: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email("Email non valida").nullable().optional(),
  website: z.string().nullable().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProfileForm({ agency }: { agency: Agency }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      business_name: agency.business_name,
      vat_number: agency.vat_number,
      fiscal_code: agency.fiscal_code,
      license_number: agency.license_number,
      address: agency.address,
      city: agency.city,
      zip_code: agency.zip_code,
      province: agency.province,
      contact_name: agency.contact_name,
      phone: agency.phone,
      email: agency.email,
      website: agency.website,
    },
  });

  function onSubmit(data: ProfileFormData) {
    setServerError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await updateAgencyProfile(agency.id, data);
      if (result.success) {
        setSuccess(true);
        router.refresh();
        // Clear success after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setServerError(result.error ?? "Errore imprevisto.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Business info */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="business_name">Ragione Sociale *</Label>
          <Input
            id="business_name"
            {...register("business_name")}
            aria-invalid={!!errors.business_name}
          />
          {errors.business_name && (
            <p className="text-sm text-destructive">
              {errors.business_name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="vat_number">Partita IVA</Label>
          <Input id="vat_number" {...register("vat_number")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fiscal_code">Codice Fiscale</Label>
          <Input id="fiscal_code" {...register("fiscal_code")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="license_number">N. Licenza</Label>
          <Input id="license_number" {...register("license_number")} />
        </div>
      </div>

      {/* Address */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="address">Indirizzo</Label>
          <Input id="address" {...register("address")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Citta</Label>
          <Input id="city" {...register("city")} />
        </div>

        <div className="flex gap-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor="zip_code">CAP</Label>
            <Input id="zip_code" {...register("zip_code")} />
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="province">Provincia</Label>
            <Input
              id="province"
              {...register("province")}
              maxLength={2}
              placeholder="MI"
            />
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact_name">Referente</Label>
          <Input id="contact_name" {...register("contact_name")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefono</Label>
          <Input id="phone" type="tel" {...register("phone")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-sm text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Sito Web</Label>
          <Input
            id="website"
            type="url"
            placeholder="https://"
            {...register("website")}
          />
        </div>
      </div>

      {/* Feedback messages */}
      {serverError && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {serverError}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Profilo aggiornato con successo.
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          <Save className="mr-1 h-4 w-4" />
          {isPending ? "Salvataggio..." : "Salva Modifiche"}
        </Button>
      </div>
    </form>
  );
}
