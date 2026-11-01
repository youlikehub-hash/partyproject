"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { partyService } from "@/features/parties/services/partyService";
import { Party } from "@/types/ledger";
import { PartyTimeline } from "@/features/parties/components/PartyTimeline";
import { PartySubmissionModal } from "@/features/parties/components/PartySubmissionModal";
import { Sparkles, Plus, LogIn, Shield, Users, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { useToast } from "@/components/common/ToastContext";

export default function HomePage() {
  const { user, isAdmin } = useAuth();
  const [parties, setParties] = useState<Party[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const { error } = useToast();

  const fetchAllParties = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await partyService.getAllParties();
      if (res.success && res.parties) {
        setParties(res.parties);
      }
    } catch {
      error("Error", "Could not fetch party history from local db.json");
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchAllParties();
  }, [fetchAllParties]);

  const handlePartySubmitted = (newParty: Party) => {
    // Refresh to show newly submitted pending party in All and Pending tabs
    fetchAllParties();
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-fuchsia-950/40 via-slate-900 to-slate-900 border border-fuchsia-500/20 p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/30 text-xs font-bold text-fuchsia-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Office Party Ledger & Archive</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {user ? `Welcome, ${user.name}!` : "Office Celebrations & Party Ledger"}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Transparent, permanent record of all office parties, treats, and milestones.
              Maintained safely with zero-database overhead via local file store.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {user ? (
              <Button
                variant="glow"
                size="lg"
                onClick={() => setIsSubmitModalOpen(true)}
                leftIcon={<Plus className="w-5 h-5 stroke-[2.5]" />}
                className="w-full sm:w-auto"
              >
                Submit Party Expense
              </Button>
            ) : (
              <Link href="/login" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<LogIn className="w-4 h-4" />}
                  className="w-full"
                >
                  Colleague Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Historical Archive Timeline */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div>
            <h2 className="text-lg font-bold text-white">Office Celebrations & Party Ledger</h2>
            <p className="text-xs text-slate-400">Section-wise view: All, Pending for Approval, and Approved celebrations</p>
          </div>

          {isAdmin && (
            <Link
              href="/admin"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              Admin Moderation Console &rarr;
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-40 rounded-3xl bg-slate-900/60 border border-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <PartyTimeline
            parties={parties}
            canSubmit={Boolean(user && user.status === "ACTIVE")}
            isAdmin={isAdmin}
            onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
          />
        )}
      </div>

      {/* Party Submission Modal */}
      <PartySubmissionModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onPartySubmitted={handlePartySubmitted}
      />
    </div>
  );
}
