"use client";

import { useState, useEffect, useRef } from "react";

interface SectionNavProps {
  sections: { id: string; label: string }[];
}

export default function SectionNav({ sections }: SectionNavProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const [isSticky, setIsSticky] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Sticky detection
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Scroll spy
  useEffect(() => {
    const observerOptions: IntersectionObserverInit = {
      rootMargin: "-120px 0px -60% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      }
    }, observerOptions);

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      const offset = 100;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }

  return (
    <>
      <div ref={sentinelRef} className="h-0" />
      <nav
        ref={navRef}
        className={`sticky top-0 z-40 transition-shadow duration-200 ${
          isSticky ? "bg-white/95 backdrop-blur-sm shadow-md border-b border-gray-100" : "bg-white border-b border-gray-200"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-thin py-1">
            {sections.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                  activeId === id
                    ? "border-[#C41E2F] text-[#C41E2F]"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}
