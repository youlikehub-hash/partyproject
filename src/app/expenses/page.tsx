"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { expenseService } from "@/features/expenses/services/expenseService";
import { Expense } from "@/types/expense";
import { ExpenseList } from "@/features/expenses/components/ExpenseList";
import { formatCurrency } from "@/lib/utils";
import { Receipt, IndianRupee, PieChart, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function ExpensesOverviewPage() {
  const { user, isAdmin } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    expenseService.getExpenses().then((res) => {
      if (res.success && res.expenses) {
        setExpenses(res.expenses);
      }
      setIsLoading(false);
    });
  }, []);

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleDeleteExpense = async (id: string): Promise<boolean> => {
    if (!window.confirm("Delete this expense record?")) return false;
    const res = await expenseService.deleteExpense(id);
    if (res.success) {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      return true;
    }
    return false;
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/20 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Receipt className="w-4 h-4" />
            Financial Ledger & Splitter
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Party Expenses & Settlements
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Centralized register of all party bills, group splits, and settlements.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-right sm:min-w-[200px]">
          <span className="text-[11px] text-slate-400 uppercase font-semibold block">
            Total Expenditure
          </span>
          <span className="text-2xl font-black text-white block mt-0.5">
            {formatCurrency(totalSpent)}
          </span>
          <span className="text-[11px] text-cyan-400 mt-0.5 block">
            {expenses.length} bills recorded
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-100">All Recorded Expenses</h3>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <ExpenseList
            expenses={expenses}
            currentUserId={user?.id}
            isHostOrAdmin={isAdmin}
            onDeleteExpense={handleDeleteExpense}
          />
        )}
      </div>
    </div>
  );
}

