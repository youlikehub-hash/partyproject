"use client";

import React from "react";
import { ToastProvider } from "@/components/common/ToastContext";
import { AuthProvider } from "@/features/auth/hooks/useAuth";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-fuchsia-500 selection:text-white pb-20 md:pb-8">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-8">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>
          <BottomNav />
        </div>
      </AuthProvider>
    </ToastProvider>
  );
}

