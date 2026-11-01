"use client";

import React, { useState } from "react";
import { ArrowRight, CheckCircle2, IndianRupee, Wallet, Check, Sparkles } from "lucide-react";
import { LedgerSummary, DebtSettlement, SettleTransactionInput } from "@/types/expense";
import { formatCurrency, getInitials, getAvatarColor } from "@/lib/utils";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import confetti from "canvas-confetti";

interface LedgerSplitterViewProps {
  ledger: LedgerSummary;
  onSettleDebt: (input: SettleTransactionInput) => Promise<boolean>;
  currentUserId?: string;
  isHostOrAdmin: boolean;
}

export function LedgerSplitterView({
  ledger,
  onSettleDebt,
  currentUserId,
  isHostOrAdmin,
}: LedgerSplitterViewProps) {
  const [selectedSettlement, setSelectedSettlement] = useState<DebtSettlement | null>(null);
  const [isSettling, setIsSettling] = useState(false);

  const handleConfirmSettlement = async () => {
    if (!selectedSettlement) return;
    try {
      setIsSettling(true);
      const ok = await onSettleDebt({
        partyId: ledger.partyId,
        fromUserId: selectedSettlement.fromUserId,
        toUserId: selectedSettlement.toUserId,
        amount: selectedSettlement.amount,
      });

      if (ok) {
        setSelectedSettlement(null);
        // Fire confetti celebration on successful settlement!
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}
      }
    } finally {
      setIsSettling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Ledger Financial Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider block">
              Total Party Expenses
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-white mt-1 block">
              {formatCurrency(ledger.totalExpense)}
            </span>
            <span className="text-xs text-fuchsia-400 mt-1 block">
              Calculated across {ledger.expenseCount} recorded bills
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/15 flex items-center justify-center text-fuchsia-400">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider block">
              Simplified Transactions Needed
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-white mt-1 block">
              {ledger.settlements.length}
            </span>
            <span className="text-xs text-emerald-400 mt-1 block">
              {ledger.settlements.length === 0 ? "All debts settled! 🎉" : "Optimized graph reduction"}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Simplified "Who Owes Whom" Section */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-slate-100">
              Who Owes Whom (Smart Debt Simplification)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            Zero Rounding Error Guaranteed
          </span>
        </div>

        {ledger.settlements.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-200">Everyone is Square!</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              No outstanding dues between attendees for this party.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ledger.settlements.map((settlement, idx) => {
              const isRelevantToUser =
                currentUserId &&
                (settlement.fromUserId === currentUserId || settlement.toUserId === currentUserId);

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    isRelevantToUser
                      ? "bg-slate-950/90 border-fuchsia-500/40 shadow-lg"
                      : "bg-slate-950/50 border-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    {/* Debtor */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 ${getAvatarColor(
                          settlement.fromUserName
                        )}`}
                      >
                        {getInitials(settlement.fromUserName)}
                      </div>
                      <span className="text-xs font-bold text-slate-200 truncate">
                        {settlement.fromUserName}
                        {settlement.fromUserId === currentUserId && " (You)"}
                      </span>
                    </div>

                    {/* Arrow & Amount */}
                    <div className="flex flex-col items-center px-2 shrink-0">
                      <span className="text-xs font-extrabold text-amber-400 font-mono">
                        owes {formatCurrency(settlement.amount)}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-500" />
                    </div>

                    {/* Creditor */}
                    <div className="flex items-center gap-2 min-w-0 justify-end">
                      <span className="text-xs font-bold text-slate-200 truncate text-right">
                        {settlement.toUserName}
                        {settlement.toUserId === currentUserId && " (You)"}
                      </span>
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 ${getAvatarColor(
                          settlement.toUserName
                        )}`}
                      >
                        {getInitials(settlement.toUserName)}
                      </div>
                    </div>
                  </div>

                  {/* Settle Action */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">Direct UPI or Cash</span>
                    <button
                      onClick={() => setSelectedSettlement(settlement)}
                      className="px-3 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold border border-emerald-500/30 transition-colors flex items-center gap-1 active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Mark Settled
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Net Balances Table / Cards */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-100">
          Individual Net Balances & Contributions
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ledger.balances.map((balance) => {
            const isOwed = balance.netBalance > 0.01;
            const owes = balance.netBalance < -0.01;

            return (
              <div
                key={balance.userId}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${getAvatarColor(
                        balance.displayName
                      )}`}
                    >
                      {getInitials(balance.displayName)}
                    </div>
                    <span className="text-sm font-bold text-slate-100">
                      {balance.displayName}
                    </span>
                  </div>

                  {/* Net status badge */}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                      isOwed
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : owes
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {isOwed && `+${formatCurrency(balance.netBalance)}`}
                    {owes && `-${formatCurrency(Math.abs(balance.netBalance))}`}
                    {!isOwed && !owes && "Settled"}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs text-slate-400">
                  <div>
                    <span className="block text-[10px] uppercase font-semibold">Total Paid</span>
                    <strong className="text-slate-200">{formatCurrency(balance.totalPaid)}</strong>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] uppercase font-semibold">Their Cut</span>
                    <strong className="text-slate-200">{formatCurrency(balance.totalShare)}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Settle Up Confirmation Modal */}
      <Modal
        isOpen={!!selectedSettlement}
        onClose={() => setSelectedSettlement(null)}
        title="Confirm Debt Settlement"
        description="Verify that the payment between attendees has been completed."
      >
        {selectedSettlement && (
          <div className="space-y-4 text-left">
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 text-center space-y-2">
              <span className="text-xs text-slate-400 uppercase font-semibold block">
                Settlement Amount
              </span>
              <span className="text-3xl font-extrabold text-emerald-400 font-mono block">
                {formatCurrency(selectedSettlement.amount)}
              </span>
              <p className="text-xs text-slate-300">
                <strong>{selectedSettlement.fromUserName}</strong> paid{" "}
                <strong>{selectedSettlement.toUserName}</strong>
              </p>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Recording this settlement creates an automated reconciliation entry in the party ledger,
              updating both attendees&apos; net balances immediately.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setSelectedSettlement(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="glow"
                isLoading={isSettling}
                onClick={handleConfirmSettlement}
              >
                Confirm Settlement
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

