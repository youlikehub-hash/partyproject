"use client";

import React, { useState } from "react";
import { AuditLog } from "@/types/audit";
import { formatDateTime } from "@/lib/utils";
import { FileText, Search, Shield, ChevronDown, ChevronUp } from "lucide-react";

interface AuditLogViewerProps {
  logs: AuditLog[];
}

export function AuditLogViewer({ logs }: AuditLogViewerProps) {
  const [search, setSearch] = useState("");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.userName?.toLowerCase().includes(search.toLowerCase()) ||
      l.resource.toLowerCase().includes(search.toLowerCase())
  );

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const getActionColor = (action: string) => {
    if (action.includes("ADMIN")) return "text-amber-400 bg-amber-400/10 border-amber-400/30";
    if (action.includes("PARTY")) return "text-fuchsia-400 bg-fuchsia-400/10 border-fuchsia-400/30";
    if (action.includes("EXPENSE") || action.includes("DEBT"))
      return "text-emerald-400 bg-emerald-400/10 border-emerald-400/30";
    return "text-cyan-400 bg-cyan-400/10 border-cyan-400/30";
  };

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            Immutable Audit Trail & System Events
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Full compliance logs recording all administrative overrides, logins, creations, and splits.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Filter audit logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
        </div>
      </div>

      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
        {filteredLogs.map((log) => {
          const isExpanded = expandedLogId === log.id;

          return (
            <div
              key={log.id}
              className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 transition-colors hover:border-slate-700 text-xs"
            >
              <div
                onClick={() => toggleExpand(log.id)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded-md font-mono font-bold text-[10px] border ${getActionColor(
                      log.action
                    )}`}
                  >
                    {log.action}
                  </span>
                  <span className="font-semibold text-slate-200">
                    {log.userName || "System"}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    [{log.resource}]
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-400">
                  <span className="text-[11px] font-mono">{formatDateTime(log.timestamp)}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2 text-slate-300 animate-in fade-in duration-150">
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">User Role:</span>
                      <strong className="text-slate-200">{log.role || "USER"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">IP Address:</span>
                      <strong className="text-slate-200">{log.ipAddress || "127.0.0.1"}</strong>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-1">Payload / Details:</span>
                    <pre className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-amber-300 overflow-x-auto">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

