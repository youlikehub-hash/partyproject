"use client";

import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { AuthTabs } from "@/features/auth/components/AuthTabs";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-950 relative overflow-hidden">
      {/* Background ambient celebratory glow circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] rounded-full bg-fuchsia-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-amber-500/15 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* App Branding */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-fuchsia-600 via-pink-600 to-amber-400 p-[1.5px] shadow-lg shadow-fuchsia-600/30 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-fuchsia-400" />
              </div>
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-fuchsia-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
              OfficePartyLedger
            </span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100">
            Office Party Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xs mx-auto">
            Permanent team record of celebrations, treats, and verified hotel bill receipts.
          </p>
        </div>

        {/* Auth Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
          <AuthTabs />
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Office Celebrations Ledger &bull; Sandeep&apos;s Approval Workflow &bull; Transparent Records
        </p>
      </div>
    </div>
  );
}
