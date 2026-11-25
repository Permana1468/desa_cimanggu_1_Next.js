"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/app/umkm/CartContext";

export function UmkmCartBadge({ mobile = false }: { mobile?: boolean }) {
  const { totalItems } = useCart();

  if (mobile) {
    return (
      <Link
        href="/umkm/cart"
        className="relative text-white p-2 bg-blue-800/70 rounded-xl border border-blue-500/50 shrink-0"
      >
        <ShoppingCart size={22} />
        {totalItems > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-950 text-[10px] font-black min-w-[20px] h-5 px-1 rounded-full border-2 border-blue-700 flex items-center justify-center">
            {totalItems > 99 ? "99+" : totalItems}
          </span>
        )}
      </Link>
    );
  }

  return (
    <Link
      href="/umkm/cart"
      className="text-white hover:text-amber-200 relative p-2.5 bg-blue-800/60 rounded-xl border border-blue-500/50 flex items-center gap-2 transition-transform hover:scale-105"
    >
      <ShoppingCart size={22} />
      <span className="text-xs font-black">Keranjang</span>
      <span className="bg-amber-400 text-slate-950 text-[11px] font-black min-w-[22px] h-[22px] px-1.5 rounded-full flex items-center justify-center shadow-sm">
        {totalItems}
      </span>
    </Link>
  );
}

