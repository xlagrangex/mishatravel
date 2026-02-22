"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Clock, MapPin, X } from "lucide-react";
import type { UnifiedDeparture } from "@/lib/supabase/queries/departures";

type Result = UnifiedDeparture & { cover_image_url: string | null };

export default function SearchResultsDropdown({
  results,
  onClose,
}: {
  results: Result[];
  onClose: () => void;
}) {
  if (results.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-full left-0 right-0 mt-3 mx-4 backdrop-blur-xl bg-white/95 rounded-xl shadow-2xl p-6 z-50"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-500 text-sm">Nessun risultato trovato. Prova a modificare i filtri.</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="size-5" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-full left-0 right-0 mt-3 mx-4 backdrop-blur-xl bg-white/95 rounded-xl shadow-2xl max-h-[400px] overflow-y-auto z-50"
    >
      <div className="sticky top-0 bg-white/95 backdrop-blur-xl px-4 pt-4 pb-2 flex items-center justify-between border-b border-gray-100">
        <p className="text-sm text-gray-500">
          {results.length} risultat{results.length === 1 ? "o" : "i"} trovat{results.length === 1 ? "o" : "i"}
        </p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="size-5" />
        </button>
      </div>

      <div className="p-2">
        {results.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              href={`${r.basePath}/${r.slug}`}
              onClick={onClose}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              {/* Thumbnail */}
              <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-200">
                {r.cover_image_url ? (
                  <Image
                    src={r.cover_image_url}
                    alt={r.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                      r.type === "tour"
                        ? "bg-[#1B2D4F]/10 text-[#1B2D4F]"
                        : "bg-[#C41E2F]/10 text-[#C41E2F]"
                    }`}
                  >
                    {r.type === "tour" ? "Tour" : "Crociera"}
                  </span>
                </div>
                <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-[#C41E2F] transition-colors">
                  {r.title}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                  {r.destination_name && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" />
                      {r.destination_name}
                    </span>
                  )}
                  {r.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {r.duration}
                    </span>
                  )}
                </div>
              </div>

              {/* Price */}
              {r.price != null && r.price > 0 && (
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400">da</p>
                  <p className="font-bold text-[#C41E2F]">
                    &euro;{r.price.toLocaleString("it-IT")}
                  </p>
                </div>
              )}
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
