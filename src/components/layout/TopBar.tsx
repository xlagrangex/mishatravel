"use client";

import { Phone, Mail, MapPin, UserCircle } from "lucide-react";
import Link from "next/link";

export default function TopBar() {
  return (
    <div className="hidden lg:block w-full bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 flex items-center justify-between h-10 text-sm text-gray-500">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <a
            href="tel:+390102461630"
            className="flex items-center gap-1.5 hover:text-[#C41E2F] transition-colors"
          >
            <Phone className="size-3.5" />
            <span>+39 010 2461630</span>
          </a>
          <span className="text-gray-300">|</span>
          <a
            href="mailto:info@mishatravel.com"
            className="flex items-center gap-1.5 hover:text-[#C41E2F] transition-colors"
          >
            <Mail className="size-3.5" />
            <span>info@mishatravel.com</span>
          </a>
          <span className="text-gray-300">|</span>
          <Link
            href="/contatti"
            className="flex items-center gap-1.5 hover:text-[#C41E2F] transition-colors"
          >
            <MapPin className="size-3.5" />
            <span>Contatti</span>
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <Link
            href="/diventa-partner"
            className="hover:text-[#C41E2F] transition-colors"
          >
            Diventa Partner
          </Link>
          <span className="text-gray-300">|</span>
          <Link
            href="/trova-agenzia"
            className="hover:text-[#C41E2F] transition-colors"
          >
            Trova Agenzia
          </Link>
          <span className="text-gray-300">|</span>
          <Link
            href="/login"
            className="flex items-center gap-1.5 hover:text-[#C41E2F] transition-colors"
          >
            <UserCircle className="size-4" />
            <span>Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
