"use client";

import React, { useState } from "react";
import { User } from "@/types/auth";
import { Badge } from "@/components/common/Badge";
import { Shield, ShieldAlert, CheckCircle, Ban, Search } from "lucide-react";
import { getInitials, getAvatarColor, formatDateTime } from "@/lib/utils";

interface UserManagementTableProps {
  users: User[];
  onToggleUser: (userId: string) => Promise<boolean>;
}

export function UserManagementTable({ users, onToggleUser }: UserManagementTableProps) {
  const [search, setSearch] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filtered = users.filter(
    (u) =>
      u.displayName.toLowerCase().includes(search.toLowerCase()) ||
      u.phoneNumber?.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = async (id: string) => {
    try {
      setProcessingId(id);
      await onToggleUser(id);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            User Accounts Directory & Status Controls
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Admin Sandeep can inspect, monitor, and suspend any user account.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Contact / ID</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Created</th>
              <th className="p-3 text-right">Admin Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {filtered.map((u) => {
              const isAdmin = u.role === "GLOBAL_ADMIN";

              return (
                <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] ${getAvatarColor(
                          u.displayName
                        )}`}
                      >
                        {getInitials(u.displayName)}
                      </div>
                      <span className="font-bold text-slate-200">{u.displayName}</span>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-slate-400">
                    {u.phoneNumber || u.username || "—"}
                  </td>
                  <td className="p-3">
                    <Badge variant="role" role={u.role}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="p-3">
                    {u.isActive ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-400 font-semibold">
                        <Ban className="w-3.5 h-3.5" />
                        Suspended
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-slate-400">{formatDateTime(u.createdAt)}</td>
                  <td className="p-3 text-right">
                    {isAdmin ? (
                      <span className="text-[11px] text-amber-400 font-bold">Master Admin</span>
                    ) : (
                      <button
                        onClick={() => handleToggle(u.id)}
                        disabled={processingId === u.id}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                          u.isActive
                            ? "bg-rose-950/30 text-rose-300 border-rose-500/30 hover:bg-rose-900/40"
                            : "bg-emerald-950/30 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/40"
                        }`}
                      >
                        {processingId === u.id
                          ? "Saving..."
                          : u.isActive
                          ? "Deactivate"
                          : "Activate"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

