"use client";

import React from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { AdminConsole } from "@/features/admin/components/AdminConsole";
import { ShieldAlert, LogIn } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/common/Button";

export default function AdminPage() {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Guard: Sandeep (Admin) required
  if (!user || !isAdmin) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-slate-900 border border-amber-500/30 text-center space-y-4 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-400 mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          This dashboard is strictly reserved for <strong>Sandeep (Admin)</strong> to approve
          pending colleague registrations and verify party bill receipts.
        </p>
        <div className="pt-2">
          <Link href="/login">
            <Button variant="glow" size="md" leftIcon={<LogIn className="w-4 h-4" />}>
              Sign In as Sandeep (Admin)
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <AdminConsole />;
}
