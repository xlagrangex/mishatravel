"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Save } from "lucide-react";
import { createAgencyFromAdmin, type CreateAgencyInput } from "../actions";

const schema = z.object({
  business_name: z.string().min(1, "Ragione sociale obbligatoria"),
  vat_number: z.string().optional(),
  fiscal_code: z.string().optional(),
  license_number: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  zip_code: z.string().optional(),
  province: z.string().optional(),
  contact_name: z.string().optional(),
  email: z.string().email("Email non valida"),
  phone: z.string().optional(),
  website: z.string().optional(),
  password: z.string().min(8, "Minimo 8 caratteri"),
  status: z.enum(["active", "pending"]),
});

type FormData = z.infer<typeof schema>;

export default function AgencyForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: "active" },
  });

  function onSubmit(data: FormData) {
    setServerError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await createAgencyFromAdmin(data as CreateAgencyInput);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => router.push("/admin/agenzie"), 1500);
      } else {
        setServerError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {serverError}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Agenzia creata con successo. Reindirizzamento...
        </div>
      )}

      {/* Dati Aziendali */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dati Aziendali</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="business_name">Ragione Sociale *</Label>
            <Input id="business_name" {...register("business_name")} />
            {errors.business_name && (
              <p className="text-sm text-destructive">{errors.business_name.message}</p>
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
            <Label htmlFor="license_number">Licenza</Label>
            <Input id="license_number" {...register("license_number")} />
          </div>
        </CardContent>
      </Card>

      {/* Indirizzo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Indirizzo</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Indirizzo</Label>
            <Input id="address" {...register("address")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Città</Label>
            <Input id="city" {...register("city")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zip_code">CAP</Label>
            <Input id="zip_code" {...register("zip_code")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="province">Provincia</Label>
            <Input id="province" {...register("province")} placeholder="es. MI" />
          </div>
        </CardContent>
      </Card>

      {/* Contatto & Credenziali */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contatto e Credenziali</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contact_name">Nome Referente</Label>
            <Input id="contact_name" {...register("contact_name")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefono</Label>
            <Input id="phone" {...register("phone")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Sito Web</Label>
            <Input id="website" {...register("website")} placeholder="https://" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <PasswordInput
              id="password"
              placeholder="Minimo 8 caratteri"
              {...register("password")}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Stato iniziale</Label>
            <Select
              value={watch("status")}
              onValueChange={(v) => setValue("status", v as "active" | "pending")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Attiva (subito operativa)</SelectItem>
                <SelectItem value="pending">In attesa di approvazione</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          <Save className="mr-1 h-4 w-4" />
          {isPending ? "Creazione..." : "Crea Agenzia"}
        </Button>
      </div>
    </form>
  );
}
