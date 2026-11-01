"use client";

import React from "react";
import { Users, PartyPopper, DollarSign, Activity, ShieldCheck, FileText } from "lucide-react";
import { SystemMetrics } from "@/types/audit";
import { formatCurrency } from "@/lib/utils";

interface SystemMetricsCardProps {
  metrics: SystemMetrics;
}

export function SystemMetricsCard({ metrics }: SystemMetricsCardProps) {
  const cards = [
    {
      label: "Total Platform Users",
      val: metrics.totalUsers,
      sub: `${metrics.activeUsers} active accounts`,
      icon: Users,
      color: "from-blue-600/20 to-cyan-600/20 border-cyan-500/30 text-cyan-400",
    },
    {
      label: "Parties Hosted",
      val: metrics.totalParties,
      sub: `${metrics.activeParties} ongoing / upcoming`,
      icon: PartyPopper,
      color: "from-fuchsia-600/20 to-pink-600/20 border-fuchsia-500/30 text-fuchsia-400",
    },
    {
      label: "Total Expense Volume",
      val: formatCurrency(metrics.totalExpensesAmount),
      sub: `${metrics.totalTransactions} ledger splits`,
      icon: DollarSign,
      color: "from-emerald-600/20 to-teal-600/20 border-emerald-500/30 text-emerald-400",
    },
    {
      label: "Audit Trail Entries",
      val: metrics.auditLogsCount,
      sub: "Immutable system logs",
      icon: FileText,
      color: "from-amber-600/20 to-orange-600/20 border-amber-500/30 text-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-4 sm:p-5 rounded-3xl bg-gradient-to-br ${card.color} bg-slate-900 border shadow-lg flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {card.label}
              </span>
              <Icon className="w-5 h-5 opacity-90" />
            </div>
            <div className="mt-3">
              <span className="text-xl sm:text-2xl font-black text-white block">
                {card.val}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">{card.sub}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

