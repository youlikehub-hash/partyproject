"use client";

import React from "react";
import { Trash2, Receipt, Calendar, CreditCard } from "lucide-react";
import { Expense } from "@/types/expense";
import { formatCurrency, formatDateTime } from "@/lib/utils";

interface ExpenseListProps {
  expenses: Expense[];
  currentUserId?: string;
  isHostOrAdmin: boolean;
  onDeleteExpense: (id: string) => Promise<boolean>;
}

export function ExpenseList({
  expenses,
  currentUserId,
  isHostOrAdmin,
  onDeleteExpense,
}: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-3xl bg-slate-900/60 border border-slate-800/80">
        <Receipt className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <h4 className="text-base font-bold text-slate-200">No Expenses Recorded Yet</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Add food, venue bookings, drinks, or travel costs to automatically calculate who owes whom.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => {
        const canDelete = isHostOrAdmin || expense.payerId === currentUserId;

        return (
          <div
            key={expense.id}
            className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700/80 transition-all shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30">
                  {expense.category}
                </span>
                <span className="text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md font-mono">
                  {expense.splitType}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  {formatDateTime(expense.createdAt)}
                </span>
              </div>

              <h4 className="text-base font-bold text-slate-100 truncate">{expense.title}</h4>

              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CreditCard className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  Paid by <strong className="text-white">{expense.payerDisplayName}</strong>
                </span>
                {expense.notes && (
                  <span className="text-slate-400 italic truncate">&bull; &quot;{expense.notes}&quot;</span>
                )}
              </div>

              {/* Split breakdown previews */}
              <div className="pt-2 flex flex-wrap gap-1.5">
                {expense.splits.map((s) => (
                  <span
                    key={s.userId}
                    className="text-[10px] bg-slate-950/70 text-slate-300 px-2 py-0.5 rounded-lg border border-slate-800"
                  >
                    {s.userDisplayName}: <strong className="text-slate-100">{formatCurrency(s.amountOwed)}</strong>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
              <div className="text-left sm:text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total</span>
                <span className="text-lg font-extrabold text-white">
                  {formatCurrency(expense.amount)}
                </span>
              </div>

              {canDelete && (
                <button
                  onClick={() => onDeleteExpense(expense.id)}
                  className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-colors"
                  title="Delete expense"
                  aria-label="Delete expense"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

