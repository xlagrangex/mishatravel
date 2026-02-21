"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  items: FAQItem[];
  title?: string;
}

export default function FAQSection({ items, title = "Domande frequenti" }: FAQSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="py-10 bg-gray-50">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-poppins)] mb-6 text-center">
          {title}
        </h2>
        <Accordion type="single" collapsible className="space-y-2">
          {items.map((item, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="bg-white border border-gray-100 rounded-lg px-4"
            >
              <AccordionTrigger className="text-sm font-medium text-gray-800 hover:text-[#C41E2F] [&[data-state=open]]:text-[#C41E2F]">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-gray-600 leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
