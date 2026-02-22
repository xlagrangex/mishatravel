"use client";

import { useState, useEffect } from "react";
import { formatPrice } from "@/lib/filters";

interface StickyBottomBarProps {
  price: number;
  label?: string;
  onClick: () => void;
}

export default function StickyBottomBar({ price, label = "Richiedi Preventivo", onClick }: StickyBottomBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] transition-transform duration-300 md:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-500">da</span>
          <span className="text-xl font-bold text-[#C41E2F] ml-1">{formatPrice(price)}</span>
          <span className="text-xs text-gray-500 ml-1">/ pers.</span>
        </div>
        <button
          onClick={onClick}
          className="px-5 py-2.5 bg-[#C41E2F] hover:bg-[#A31825] text-white font-semibold rounded-lg text-sm transition-colors"
        >
          {label}
        </button>
      </div>
    </div>
  );
}
