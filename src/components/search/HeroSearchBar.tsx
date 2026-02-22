"use client";

import { useState } from "react";
import { Search, Calendar, Sun } from "lucide-react";

interface HeroSearchBarProps {
  variant: "cruise" | "tour";
  locationOptions: { value: string; label: string }[];
  onSearch: (query: { dove: string; quando: string; durata: string }) => void;
}

const SEASON_OPTIONS = [
  { value: "", label: "Qualsiasi periodo" },
  { value: "primavera", label: "Primavera (Mar-Mag)" },
  { value: "estate", label: "Estate (Giu-Ago)" },
  { value: "autunno", label: "Autunno (Set-Nov)" },
  { value: "inverno", label: "Inverno (Dic-Feb)" },
];

const CRUISE_DURATION_OPTIONS = [
  { value: "", label: "Qualsiasi durata" },
  { value: "4-5", label: "4-5 notti" },
  { value: "7-8", label: "7-8 notti" },
  { value: "10+", label: "10+ notti" },
];

const TOUR_DURATION_OPTIONS = [
  { value: "", label: "Qualsiasi durata" },
  { value: "5-7", label: "5-7 giorni" },
  { value: "8-12", label: "8-12 giorni" },
  { value: "13+", label: "13+ giorni" },
];

type QuandoMode = "stagione" | "data";

export default function HeroSearchBar({ variant, locationOptions, onSearch }: HeroSearchBarProps) {
  const [dove, setDove] = useState("");
  const [quandoMode, setQuandoMode] = useState<QuandoMode>("stagione");
  const [quandoStagione, setQuandoStagione] = useState("");
  const [quandoData, setQuandoData] = useState("");
  const [durata, setDurata] = useState("");

  const durationOptions = variant === "cruise" ? CRUISE_DURATION_OPTIONS : TOUR_DURATION_OPTIONS;

  const handleSearch = () => {
    const quando = quandoMode === "stagione" ? quandoStagione : quandoData;
    onSearch({ dove, quando, durata });
  };

  const switchMode = (mode: QuandoMode) => {
    setQuandoMode(mode);
    if (mode === "stagione") setQuandoData("");
    else setQuandoStagione("");
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-3 md:p-4">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Dove */}
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 mb-1 px-1">
            {variant === "cruise" ? "Quale fiume?" : "Dove vuoi andare?"}
          </label>
          <select
            value={dove}
            onChange={(e) => setDove(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C41E2F]/30 focus:border-[#C41E2F]"
          >
            <option value="">Tutte le {variant === "cruise" ? "destinazioni" : "aree"}</option>
            {locationOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Quando */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1 px-1">
            <label className="text-xs font-medium text-gray-500">Quando?</label>
            <div className="flex gap-0.5 rounded-md bg-gray-100 p-0.5">
              <button
                type="button"
                onClick={() => switchMode("stagione")}
                className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                  quandoMode === "stagione"
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Sun className="size-2.5" />
                Stagione
              </button>
              <button
                type="button"
                onClick={() => switchMode("data")}
                className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                  quandoMode === "data"
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Calendar className="size-2.5" />
                Data
              </button>
            </div>
          </div>
          {quandoMode === "stagione" ? (
            <select
              value={quandoStagione}
              onChange={(e) => setQuandoStagione(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C41E2F]/30 focus:border-[#C41E2F]"
            >
              {SEASON_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="date"
              value={quandoData}
              onChange={(e) => setQuandoData(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C41E2F]/30 focus:border-[#C41E2F]"
            />
          )}
        </div>

        {/* Durata */}
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 mb-1 px-1">Durata</label>
          <select
            value={durata}
            onChange={(e) => setDurata(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C41E2F]/30 focus:border-[#C41E2F]"
          >
            {durationOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Search button */}
        <div className="flex items-end">
          <button
            onClick={handleSearch}
            className="w-full md:w-auto px-6 py-2.5 bg-[#C41E2F] hover:bg-[#A31825] text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Search className="size-4" />
            <span>Cerca</span>
          </button>
        </div>
      </div>
    </div>
  );
}
