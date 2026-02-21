import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Mail } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  return (
    <section className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 max-w-5xl mx-auto overflow-hidden rounded-xl shadow-lg">
          {/* Left - decorative */}
          <div className="relative hidden lg:block min-h-[500px]">
            <Image
              src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=600&fit=crop"
              alt="Viaggio"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1B2D4F]/80 to-[#1B2D4F]/50 flex items-center justify-center">
              <div className="text-white text-center px-8">
                <h2 className="text-3xl font-bold font-[family-name:var(--font-poppins)] mb-4">
                  Area Riservata
                </h2>
                <p className="text-white/80 leading-relaxed">
                  Accedi alla tua area riservata per gestire le prenotazioni,
                  consultare i cataloghi e accedere al portale B2B.
                </p>
              </div>
            </div>
          </div>

          {/* Right - form */}
          <div className="bg-white p-8 lg:p-12 flex flex-col justify-center">
            <div className="max-w-sm mx-auto w-full">
              <h1 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-2">
                Accedi
              </h1>
              <p className="text-gray-500 mb-8">
                Inserisci le tue credenziali per accedere all&apos;area riservata.
              </p>

              <form className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input type="email" placeholder="email@esempio.com" className="pl-10" required />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input type="password" placeholder="La tua password" className="pl-10" required />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input type="checkbox" />
                    Ricordami
                  </label>
                  <Link href="/reset" className="text-sm text-[#C41E2F] hover:underline">
                    Password dimenticata?
                  </Link>
                </div>

                <Button type="submit" className="w-full bg-[#C41E2F] hover:bg-[#A31825] text-white" size="lg">
                  Accedi
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-500">
                Non hai ancora un account?{" "}
                <Link href="/registrazione" className="text-[#C41E2F] font-medium hover:underline">
                  Registrati
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
