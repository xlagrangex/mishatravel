"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, ChevronDown, ChevronRight, MapPin } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { mainNavItems } from "@/lib/data";
import { cn } from "@/lib/utils";

type DestItem = { name: string; slug: string; hasProducts: boolean };

type Props = {
  destinationsByArea: Record<string, DestItem[]>;
};

export default function Header({ destinationsByArea }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileDestOpen, setMobileDestOpen] = useState(false);

  const macroAreas = Object.keys(destinationsByArea).filter(
    (area) => destinationsByArea[area].length > 0
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-white transition-shadow duration-300",
        scrolled && "shadow-md"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between h-16 lg:h-20">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Image
            src="/images/logo/logo.webp"
            alt="Misha Travel"
            width={180}
            height={60}
            className="h-10 lg:h-14 w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {mainNavItems.map((item) =>
            item.label === "Destinazioni" ? (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => setMegaMenuOpen(true)}
                onMouseLeave={() => setMegaMenuOpen(false)}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#C41E2F] transition-colors nav-link-underline"
                >
                  {item.label}
                  <ChevronDown
                    className={cn(
                      "size-4 transition-transform duration-200",
                      megaMenuOpen && "rotate-180"
                    )}
                  />
                </Link>

                {/* Mega Menu Dropdown */}
                {megaMenuOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-[820px] bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                    <div className="px-6 pt-5 pb-4" style={{ columns: Math.min(macroAreas.length, 4), columnGap: "1.5rem" }}>
                      {macroAreas.map((area) => {
                        const isFluviali = area === "Percorsi Fluviali";
                        return (
                          <div key={area} className="break-inside-avoid mb-4">
                            <h4
                              className={cn(
                                "font-semibold text-xs uppercase tracking-wider mb-1.5 font-[family-name:var(--font-poppins)]",
                                isFluviali ? "text-[#1B6FA8]" : "text-[#C41E2F]"
                              )}
                            >
                              {area}
                            </h4>
                            <ul className="space-y-0.5">
                              {destinationsByArea[area].map((dest) =>
                                dest.hasProducts ? (
                                  <li key={dest.slug}>
                                    <Link
                                      href={`/destinazioni/${dest.slug}`}
                                      className={cn(
                                        "group/link flex items-center gap-1.5 text-sm text-gray-600 transition-colors py-0.5",
                                        isFluviali
                                          ? "hover:text-[#1B6FA8]"
                                          : "hover:text-[#C41E2F]"
                                      )}
                                    >
                                      <ChevronRight
                                        className={cn(
                                          "size-3 opacity-0 -ml-4 group-hover/link:opacity-100 group-hover/link:ml-0 transition-all duration-200",
                                          isFluviali ? "text-[#1B6FA8]" : "text-[#C41E2F]"
                                        )}
                                      />
                                      {dest.name}
                                    </Link>
                                  </li>
                                ) : (
                                  <li key={dest.slug} className="relative group/disabled">
                                    <span className="flex items-center text-sm text-gray-300 py-0.5 cursor-default">
                                      {dest.name}
                                    </span>
                                    <span className="absolute left-0 -top-6 hidden group-hover/disabled:block bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap z-10">
                                      Presto disponibile
                                    </span>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                    {/* Footer with CTA */}
                    <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="size-4 text-[#C41E2F]" />
                        <span>{Object.values(destinationsByArea).flat().length} destinazioni disponibili</span>
                      </div>
                      <Link
                        href="/destinazioni"
                        className="text-sm font-semibold text-[#C41E2F] hover:text-[#A31825] transition-colors flex items-center gap-1"
                      >
                        Tutte le destinazioni
                        <ChevronRight className="size-4" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#C41E2F] transition-colors nav-link-underline"
              >
                {item.label}
              </Link>
            )
          )}
        </nav>

        {/* Mobile Hamburger */}
        <Sheet>
          <SheetTrigger asChild>
            <button
              className="lg:hidden p-2 text-gray-700 hover:text-[#C41E2F] transition-colors"
              aria-label="Apri menu"
            >
              <Menu className="size-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0">
            <SheetHeader className="p-4 border-b border-gray-100">
              <SheetTitle className="text-left">
                <Image
                  src="/images/logo/logo.webp"
                  alt="Misha Travel"
                  width={140}
                  height={47}
                  className="h-8 w-auto"
                />
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col py-2 overflow-y-auto max-h-[calc(100vh-80px)]">
              {mainNavItems.map((item) =>
                item.label === "Destinazioni" ? (
                  <div key={item.href}>
                    <button
                      onClick={() => setMobileDestOpen(!mobileDestOpen)}
                      className="flex items-center justify-between w-full px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium">{item.label}</span>
                      <ChevronDown
                        className={cn(
                          "size-4 transition-transform duration-200",
                          mobileDestOpen && "rotate-180"
                        )}
                      />
                    </button>
                    {mobileDestOpen && (
                      <div className="bg-gray-50 py-2">
                        {macroAreas.map((area) => {
                          const isFluviali = area === "Percorsi Fluviali";
                          return (
                            <div key={area} className="px-4 py-2">
                              <p
                                className={cn(
                                  "text-xs font-semibold uppercase tracking-wider mb-1",
                                  isFluviali ? "text-[#1B6FA8]" : "text-[#C41E2F]"
                                )}
                              >
                                {area}
                              </p>
                              <div className="flex flex-wrap gap-x-3 gap-y-1">
                                {destinationsByArea[area].map((dest) =>
                                  dest.hasProducts ? (
                                    <SheetClose asChild key={dest.slug}>
                                      <Link
                                        href={`/destinazioni/${dest.slug}`}
                                        className={cn(
                                          "text-sm text-gray-600 transition-colors",
                                          isFluviali
                                            ? "hover:text-[#1B6FA8]"
                                            : "hover:text-[#C41E2F]"
                                        )}
                                      >
                                        {dest.name}
                                      </Link>
                                    </SheetClose>
                                  ) : (
                                    <span
                                      key={dest.slug}
                                      className="text-sm text-gray-300 cursor-default"
                                    >
                                      {dest.name}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          );
                        })}
                        <div className="px-4 pt-2 pb-1">
                          <SheetClose asChild>
                            <Link
                              href="/destinazioni"
                              className="text-sm font-medium text-[#C41E2F]"
                            >
                              Tutte le destinazioni →
                            </Link>
                          </SheetClose>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className="px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                )
              )}

              {/* Mobile-only links */}
              <div className="border-t border-gray-100 mt-2 pt-2">
                <SheetClose asChild>
                  <Link
                    href="/diventa-partner"
                    className="block px-4 py-3 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    Diventa Partner
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/trova-agenzia"
                    className="block px-4 py-3 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    Trova Agenzia
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/login"
                    className="block px-4 py-3 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    Login
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/contatti"
                    className="block px-4 py-3 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    Contatti
                  </Link>
                </SheetClose>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
