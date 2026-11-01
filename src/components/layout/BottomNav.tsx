"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PartyPopper, Shield, LogIn, User } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function BottomNav() {
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();

  if (pathname === "/login") return null;

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800/80 backdrop-blur-lg pb-safe"
    >
      <div className="flex items-center justify-around h-16 px-4 max-w-lg mx-auto">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] gap-1 transition-colors select-none ${
            pathname === "/" ? "text-fuchsia-400 font-bold" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <PartyPopper className={`w-5 h-5 ${pathname === "/" ? "stroke-[2.4]" : ""}`} />
          <span className="text-[11px] leading-none">Archive</span>
        </Link>

        {isAdmin && (
          <Link
            href="/admin"
            className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] gap-1 transition-colors select-none ${
              pathname.startsWith("/admin")
                ? "text-amber-400 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Shield className={`w-5 h-5 ${pathname.startsWith("/admin") ? "stroke-[2.4]" : ""}`} />
            <span className="text-[11px] leading-none">Admin</span>
          </Link>
        )}

        <Link
          href={user ? "/" : "/login"}
          className="flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] gap-1 text-slate-400 hover:text-slate-200 transition-colors select-none"
        >
          {user ? <User className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
          <span className="text-[11px] leading-none">{user ? user.name.split(" ")[0] : "Sign In"}</span>
        </Link>
      </div>
    </nav>
  );
}
