import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowLeft } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <section className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#1B2D4F] mb-6">
            <ArrowLeft className="size-4" />
            Torna al Login
          </Link>

          <h1 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-2">
            Recupera Password
          </h1>
          <p className="text-gray-500 mb-8 text-sm">
            Inserisci l&apos;indirizzo email associato al tuo account. Riceverai un link per reimpostare
            la password.
          </p>

          <form className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input type="email" placeholder="email@esempio.com" className="pl-10" required />
              </div>
            </div>

            <Button type="submit" className="w-full bg-[#C41E2F] hover:bg-[#A31825] text-white" size="lg">
              Invia Link di Recupero
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Ricordi la password?{" "}
            <Link href="/login" className="text-[#C41E2F] font-medium hover:underline">
              Accedi
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
