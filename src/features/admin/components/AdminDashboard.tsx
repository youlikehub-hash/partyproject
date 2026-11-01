"use client";

import React, { useState, useEffect, useCallback } from "react";
import { SystemMetrics, AuditLog } from "@/types/audit";
import { User } from "@/types/auth";
import { Party } from "@/types/party";
import { adminService } from "../services/adminService";
import { partyService } from "@/features/parties/services/partyService";
import { SystemMetricsCard } from "./SystemMetricsCard";
import { UserManagementTable } from "./UserManagementTable";
import { GlobalPartyManager } from "./GlobalPartyManager";
import { AuditLogViewer } from "./AuditLogViewer";
import { useToast } from "@/components/common/ToastContext";
import { Shield, RefreshCw, PartyPopper, Users, FileText } from "lucide-react";

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<"parties" | "users" | "logs">("parties");
  const [isLoading, setIsLoading] = useState(true);

  const { success, error } = useToast();

  const loadAllAdminData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [statsRes, usersRes, partiesRes, logsRes] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
        partyService.getParties(),
        adminService.getAuditLogs(),
      ]);

      if (statsRes.success && statsRes.metrics) setMetrics(statsRes.metrics);
      if (usersRes.success && usersRes.users) setUsers(usersRes.users);
      if (partiesRes.success && partiesRes.parties) setParties(partiesRes.parties);
      if (logsRes.success && logsRes.logs) setLogs(logsRes.logs);
    } catch {
      error("Admin Error", "Failed to fetch administrative data.");
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    loadAllAdminData();
  }, [loadAllAdminData]);

  const handleToggleUser = async (userId: string) => {
    const res = await adminService.toggleUser(userId);
    if (res.success && res.user) {
      success("User Status Updated", res.message);
      setUsers((prev) => prev.map((u) => (u.id === userId ? res.user! : u)));
      return true;
    } else {
      error("Action Failed", res.message);
      return false;
    }
  };

  const handleOverrideParty = async (data: {
    partyId: string;
    hostUserId?: string;
    status?: Party["status"];
  }) => {
    const res = await adminService.overrideParty(data);
    if (res.success && res.party) {
      success("Admin Override Applied", res.message);
      setParties((prev) => prev.map((p) => (p.id === data.partyId ? res.party! : p)));
      loadAllAdminData(); // refresh audit logs & metrics
      return true;
    } else {
      error("Override Failed", res.message);
      return false;
    }
  };

  const handleDeleteParty = async (partyId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this party and all its expenses?")) {
      return false;
    }
    const res = await partyService.deleteParty(partyId);
    if (res.success) {
      success("Party Deleted", "Party and ledgers purged successfully.");
      setParties((prev) => prev.filter((p) => p.id !== partyId));
      loadAllAdminData();
      return true;
    } else {
      error("Delete Failed", res.message);
      return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-500/15 via-fuchsia-600/10 to-slate-900 border border-amber-500/30 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            Elevated GLOBAL_ADMIN Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Sandeep&apos;s Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Global governance over parties, financial ledgers, audit trails, and user permissions across PartyPilot.
          </p>
        </div>

        <button
          onClick={loadAllAdminData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all shadow-md active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Metrics
        </button>
      </div>

      {/* Metrics Row */}
      {metrics && <SystemMetricsCard metrics={metrics} />}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("parties")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "parties"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <PartyPopper className="w-4 h-4" />
          Global Parties ({parties.length})
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "users"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Users className="w-4 h-4" />
          User Directory ({users.length})
        </button>

        <button
          onClick={() => setActiveTab("logs")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "logs"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <FileText className="w-4 h-4" />
          Audit Logs ({logs.length})
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "parties" && (
        <GlobalPartyManager
          parties={parties}
          users={users}
          onOverrideParty={handleOverrideParty}
          onDeleteParty={handleDeleteParty}
        />
      )}

      {activeTab === "users" && (
        <UserManagementTable users={users} onToggleUser={handleToggleUser} />
      )}

      {activeTab === "logs" && <AuditLogViewer logs={logs} />}
    </div>
  );
}

