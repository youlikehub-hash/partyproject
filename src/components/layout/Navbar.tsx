"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Shield, LogOut, PartyPopper, UserCircle } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getInitials, getAvatarColor } from "@/lib/utils";

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-fuchsia-600 via-pink-600 to-amber-400 p-[1px] shadow-lg shadow-fuchsia-600/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-fuchsia-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-fuchsia-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
              OfficePartyLedger
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold hidden sm:inline">
              Zero-DB File Store
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80">
          <Link
            href="/"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              pathname === "/"
                ? "bg-fuchsia-600/20 text-fuchsia-300 border border-fuchsia-500/30"
                : "text-slate-300 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <PartyPopper className="w-4 h-4 text-fuchsia-400" />
            Historical Archive
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                pathname.startsWith("/admin")
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "text-amber-400/90 hover:text-amber-300 hover:bg-amber-500/10"
              }`}
            >
              <Shield className="w-4 h-4 text-amber-400" />
              Sandeep&apos;s Console
            </Link>
          )}
        </nav>

        {/* User Info / Logout */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ring-2 ring-slate-800 shadow-md ${getAvatarColor(
                    user.name
                  )}`}
                >
                  {getInitials(user.name)}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-100 leading-tight">
                      {user.name}
                    </span>
                    {isAdmin && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 rounded font-bold">
                        Admin
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 leading-none mt-0.5">
                    {user.mobileNumber}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                title="Log out"
                aria-label="Log out"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-sm font-semibold transition-all shadow-md shadow-fuchsia-600/30 min-h-[44px]"
            >
              <UserCircle className="w-4 h-4" />
              Colleague Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
