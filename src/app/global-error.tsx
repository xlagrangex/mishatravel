"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <html lang="it">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f9fafb" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ maxWidth: 560, width: "100%", background: "white", borderRadius: 12, padding: 32, boxShadow: "0 1px 3px rgba(0,0,0,.08)" }}>
            <h1 style={{ color: "#1B2D4F", fontSize: 22, marginTop: 0 }}>Si è verificato un errore</h1>
            <p style={{ color: "#4b5563", lineHeight: 1.6 }}>
              Ci scusiamo per l&apos;inconveniente. Riprova ad aggiornare la pagina.
            </p>
            {error.digest && (
              <p style={{ color: "#9ca3af", fontSize: 12, fontFamily: "monospace" }}>
                Codice errore: {error.digest}
              </p>
            )}
            <button
              onClick={() => reset()}
              style={{ marginTop: 16, background: "#C41E2F", color: "white", border: 0, padding: "10px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}
            >
              Ricarica
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
