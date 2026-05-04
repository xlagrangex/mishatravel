"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[PublicError]", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-xl w-full bg-white border border-gray-100 rounded-xl p-8 shadow-sm text-center">
        <h1 className="text-2xl font-bold text-[#1B2D4F] font-[family-name:var(--font-poppins)] mb-3">
          Qualcosa è andato storto
        </h1>
        <p className="text-gray-600 mb-2">
          Si è verificato un errore inatteso durante il caricamento di questa sezione.
        </p>
        <p className="text-gray-500 text-sm mb-6">
          Puoi provare a ricaricare la pagina oppure tornare alla home. Se il problema persiste,{" "}
          <Link href="/contatti" className="text-[#C41E2F] underline">contattaci</Link>.
        </p>
        {error.digest && (
          <p className="text-gray-400 text-xs font-mono mb-4">
            Codice errore: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="bg-[#C41E2F] hover:bg-[#A31825] text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            Riprova
          </button>
          <Link
            href="/"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            Vai alla home
          </Link>
        </div>
      </div>
    </div>
  );
}
