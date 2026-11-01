"use client";

import React from "react";
import { Search } from "lucide-react";
import { PartyStatus } from "@/types/party";

interface PartyFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: PartyStatus | "All";
  onStatusChange: (status: PartyStatus | "All") => void;
}

export function PartyFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: PartyFiltersProps) {
  const statuses: (PartyStatus | "All")[] = ["All", "Upcoming", "Ongoing", "Completed"];

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by party title, venue, or host name..."
          className="w-full h-11 pl-10 pr-4 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all"
        />
      </div>

      {/* Status Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {statuses.map((status) => {
          const isActive = statusFilter === status;
          return (
            <button
              key={status}
              onClick={() => onStatusChange(status)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all min-h-[36px] flex items-center justify-center ${
                isActive
                  ? "bg-fuchsia-600 text-white shadow-md shadow-fuchsia-600/30"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700"
              }`}
            >
              {status}
            </button>
          );
        })}
      </div>
    </div>
  );
}

