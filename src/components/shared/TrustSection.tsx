"use client";

import { Users, Globe, Shield, HeadphonesIcon } from "lucide-react";

const TRUST_ITEMS = [
  {
    icon: Users,
    title: "Accompagnatore italiano",
    description: "Ogni tour e seguito da un accompagnatore esperto in lingua italiana, dall'Italia.",
  },
  {
    icon: Globe,
    title: "Oltre 30 anni di esperienza",
    description: "Dal 1993 organizziamo viaggi di qualita in tutto il mondo.",
  },
  {
    icon: Shield,
    title: "Gruppi piccoli",
    description: "Massimo 25 partecipanti per garantire un'esperienza autentica e personalizzata.",
  },
  {
    icon: HeadphonesIcon,
    title: "Assistenza dedicata",
    description: "Il nostro team e sempre disponibile, prima, durante e dopo il viaggio.",
  },
];

export default function TrustSection() {
  return (
    <section className="py-10 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-poppins)] mb-8 text-center">
          Perche scegliere Misha Travel
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_ITEMS.map((item) => (
            <div key={item.title} className="text-center">
              <div className="size-12 rounded-full bg-[#C41E2F]/10 flex items-center justify-center mx-auto mb-3">
                <item.icon className="size-6 text-[#C41E2F]" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
