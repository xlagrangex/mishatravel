"use client"

import { useState } from "react"
import Link from "next/link"
import { Shield, BarChart3, Target, Settings2, X } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import type { CookieConsent } from "@/lib/cookie-consent"

interface CookieConsentBannerProps {
  consent: CookieConsent | null
  onAcceptAll: () => void
  onRejectNonEssential: () => void
  onSavePreferences: (analytics: boolean, marketing: boolean) => void
  onClose: () => void
}

export default function CookieConsentBanner({
  consent,
  onAcceptAll,
  onRejectNonEssential,
  onSavePreferences,
  onClose,
}: CookieConsentBannerProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [analytics, setAnalytics] = useState(consent?.analytics ?? false)
  const [marketing, setMarketing] = useState(consent?.marketing ?? false)

  return (
    <div className="fixed inset-0 z-[9999] flex items-end bg-black/40 backdrop-blur-sm">
      <div className="w-full bg-white shadow-2xl border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 py-5 sm:py-6">
          {/* Header */}
          <div className="flex items-start gap-3 sm:gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo/logo-cropped-logo-270x270.png"
              alt="MishaTravel"
              width={48}
              height={48}
              className="size-10 sm:size-12 rounded-lg shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-[#1B2D4F] font-[family-name:var(--font-poppins)]">
                Informativa sui Cookie
              </h3>
              <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                Utilizziamo cookie per migliorare la tua esperienza, analizzare il traffico e personalizzare i contenuti.
                Puoi scegliere quali accettare.{" "}
                <Link
                  href="/cookie-policy"
                  className="text-[#C41E2F] hover:underline font-medium"
                >
                  Cookie Policy
                </Link>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 -m-1 shrink-0"
              aria-label="Chiudi"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Details panel */}
          {showDetails && (
            <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 divide-y divide-gray-100">
              {/* Necessary */}
              <div className="flex items-center gap-3 px-4 py-3">
                <Shield className="size-5 text-[#1B2D4F] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1B2D4F]">Cookie Necessari</p>
                  <p className="text-xs text-gray-500">Essenziali per il funzionamento del sito</p>
                </div>
                <Switch checked disabled className="data-[state=checked]:bg-[#C41E2F] opacity-70" />
              </div>

              {/* Analytics */}
              <div className="flex items-center gap-3 px-4 py-3">
                <BarChart3 className="size-5 text-[#1B2D4F] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1B2D4F]">Cookie Analitici</p>
                  <p className="text-xs text-gray-500">Ci aiutano a capire come usi il sito</p>
                </div>
                <Switch
                  checked={analytics}
                  onCheckedChange={setAnalytics}
                  className="data-[state=checked]:bg-[#C41E2F]"
                />
              </div>

              {/* Marketing */}
              <div className="flex items-center gap-3 px-4 py-3">
                <Target className="size-5 text-[#1B2D4F] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1B2D4F]">Cookie di Marketing</p>
                  <p className="text-xs text-gray-500">Per mostrarti contenuti personalizzati</p>
                </div>
                <Switch
                  checked={marketing}
                  onCheckedChange={setMarketing}
                  className="data-[state=checked]:bg-[#C41E2F]"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mt-4">
            {!showDetails ? (
              <button
                onClick={() => setShowDetails(true)}
                className="order-3 sm:order-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-[#1B2D4F] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Settings2 className="size-4" />
                Personalizza
              </button>
            ) : (
              <button
                onClick={() => onSavePreferences(analytics, marketing)}
                className="order-3 sm:order-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-[#1B2D4F] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Salva Preferenze
              </button>
            )}

            <div className="flex-1 hidden sm:block" />

            <button
              onClick={onRejectNonEssential}
              className="order-2 inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-[#1B2D4F] border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Rifiuta non essenziali
            </button>

            <button
              onClick={onAcceptAll}
              className="order-1 sm:order-3 inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-[#C41E2F] hover:bg-[#A31825] rounded-lg transition-colors shadow-sm"
            >
              Accetta tutti
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
