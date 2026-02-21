"use client";

import Link from "next/link";
import { Calendar, MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDateIT } from "@/lib/filters";

interface DepartureItem {
  title: string;
  slug: string;
  basePath: string;
  type: "tour" | "crociera";
  date: string;
  destination: string;
  duration: string;
  price: number;
}

interface DepartureTimelineProps {
  departures: DepartureItem[];
  title?: string;
}

export default function DepartureTimeline({
  departures,
  title = "Prossime partenze",
}: DepartureTimelineProps) {
  if (departures.length === 0) return null;

  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-poppins)] mb-6">
          {title}
        </h2>
        <div className="space-y-3">
          {departures.map((dep, i) => (
            <Link
              key={`${dep.slug}-${dep.date}-${i}`}
              href={`${dep.basePath}/${dep.slug}`}
              className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-white rounded-lg border border-gray-100 hover:border-[#C41E2F]/30 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3 shrink-0">
                <div className="size-10 rounded-lg bg-gray-100 group-hover:bg-[#C41E2F]/10 flex items-center justify-center transition-colors">
                  <Calendar className="size-5 text-gray-500 group-hover:text-[#C41E2F] transition-colors" />
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">{formatDateIT(dep.date)}</p>
                  <Badge
                    className={`text-[10px] mt-0.5 ${
                      dep.type === "tour" ? "bg-gray-800 text-white" : "bg-[#C41E2F] text-white"
                    }`}
                  >
                    {dep.type === "tour" ? "Tour" : "Crociera"}
                  </Badge>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{dep.title}</p>
                <div className="flex gap-3 mt-0.5 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><MapPin className="size-3" />{dep.destination}</span>
                  <span className="flex items-center gap-1"><Clock className="size-3" />{dep.duration}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-gray-500">da </span>
                <span className="text-lg font-bold text-[#C41E2F]">{formatPrice(dep.price)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
