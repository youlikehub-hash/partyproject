"use client";

import React, { useState, useEffect, useCallback } from "react";
import { User, Party, UserStatus } from "@/types/ledger";
import { userService } from "@/features/users/services/userService";
import { partyService } from "@/features/parties/services/partyService";
import { useToast } from "@/components/common/ToastContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Shield,
  Users,
  PartyPopper,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  Receipt,
  FileText,
  Search,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";

export function AdminConsole() {
  const [users, setUsers] = useState<Omit<User, "password">[]>([]);
  const [pendingParties, setPendingParties] = useState<Party[]>([]);
  const [activeTab, setActiveTab] = useState<"parties" | "users">("parties");
  const [isLoading, setIsLoading] = useState(true);

  // Bill inspection state
  const [inspectParty, setInspectParty] = useState<Party | null>(null);
  const [adminRemarks, setAdminRemarks] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { success, error } = useToast();

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [usersRes, partiesRes] = await Promise.all([
        userService.getAllUsers(),
        partyService.getPendingParties(),
      ]);

      if (usersRes.success && usersRes.users) {
        setUsers(usersRes.users);
      }
      if (partiesRes.success && partiesRes.parties) {
        setPendingParties(partiesRes.parties);
      }
    } catch {
      error("Admin Error", "Failed to load dashboard data from local db.json.");
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUserStatusChange = async (userId: string, newStatus: UserStatus) => {
    try {
      setProcessingId(userId);
      const res = await userService.updateStatus(userId, newStatus);
      if (res.success && res.user) {
        success("User Status Updated", res.message);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: res.user!.status } : u))
        );
      } else {
        error("Action Failed", res.message || "Could not update user status.");
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleModerateParty = async (partyId: string, status: "APPROVED" | "REJECTED") => {
    try {
      setProcessingId(partyId);
      const remarks = adminRemarks[partyId] || "";
      const res = await partyService.moderateParty(partyId, status, remarks);
      if (res.success && res.party) {
        success(
          status === "APPROVED" ? "Party Approved!" : "Party Rejected",
          res.message
        );
        setPendingParties((prev) => prev.filter((p) => p.id !== partyId));
        if (inspectParty?.id === partyId) setInspectParty(null);
      } else {
        error("Action Failed", res.message || "Could not moderate party.");
      }
    } finally {
      setProcessingId(null);
    }
  };

  const pendingUsers = users.filter((u) => u.status === "PENDING");
  const activeUsers = users.filter((u) => u.status === "ACTIVE" && u.role !== "ADMIN");
  const deactivatedUsers = users.filter((u) => u.status === "DEACTIVATED");

  return (
    <div className="space-y-6">
      {/* Admin Master Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-500/15 via-fuchsia-600/10 to-slate-900 border border-amber-500/30 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            Zero-DB File Store Management &bull; data/db.json
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Sandeep&apos;s Administration Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Review and approve pending colleague sign-ups, inspect bill receipts, and moderate team party entries.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all shadow-md active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Data
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Pending Parties</span>
            <span className="text-2xl font-black text-amber-400 block mt-1">
              {pendingParties.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Pending Users</span>
            <span className="text-2xl font-black text-fuchsia-400 block mt-1">
              {pendingUsers.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-fuchsia-500/15 flex items-center justify-center text-fuchsia-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Active Members</span>
            <span className="text-2xl font-black text-emerald-400 block mt-1">
              {activeUsers.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Deactivated Users</span>
            <span className="text-2xl font-black text-rose-400 block mt-1">
              {deactivatedUsers.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center text-rose-400">
            <Ban className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("parties")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "parties"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <PartyPopper className="w-4 h-4" />
          Party Submissions Review ({pendingParties.length})
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "users"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Users className="w-4 h-4" />
          User Management & Approvals ({pendingUsers.length} Pending)
        </button>
      </div>

      {/* TAB 1: Party Submissions Review */}
      {activeTab === "parties" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Pending Party Expenses</h3>
            <span className="text-xs text-slate-400">Review receipts before approving into archive</span>
          </div>

          {pendingParties.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-3xl bg-slate-900/60 border border-slate-800">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-200">All Caught Up!</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                There are no pending party submissions awaiting moderation.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingParties.map((party) => (
                <div
                  key={party.id}
                  className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-amber-500/30 shadow-xl space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-xs font-semibold text-slate-400">
                        Date: {formatDate(party.date)}
                      </span>
                      <h4 className="text-lg font-bold text-white">{party.hotelName}</h4>
                      <span className="text-xs text-fuchsia-300 font-semibold">
                        Submitted by: {party.hostName}
                      </span>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-xs text-slate-400 block font-semibold">Amount Spent:</span>
                      <span className="text-2xl font-black text-emerald-400 font-mono block">
                        {formatCurrency(party.amountSpent)}
                      </span>
                    </div>
                  </div>

                  {party.remarks && (
                    <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <strong>Occasion / Remarks:</strong> &quot;{party.remarks}&quot;
                    </p>
                  )}

                  {/* Bill Receipt Thumbnail + Modal Trigger */}
                  {party.billImageUrl && (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setInspectParty(party)}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs text-cyan-300 border border-cyan-500/30 transition-colors"
                      >
                        <Receipt className="w-4 h-4 text-cyan-400" />
                        <span>Inspect Bill Receipt Screenshot</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Sandeep's Remarks Input */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <label className="block text-xs font-semibold text-amber-300 uppercase tracking-wide">
                      Sandeep&apos;s Verification Remarks (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tax invoice verified. Cleared for company records."
                      value={adminRemarks[party.id] || ""}
                      onChange={(e) =>
                        setAdminRemarks({ ...adminRemarks, [party.id]: e.target.value })
                      }
                      className="w-full h-10 px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleModerateParty(party.id, "REJECTED")}
                      isLoading={processingId === party.id}
                      leftIcon={<XCircle className="w-3.5 h-3.5" />}
                    >
                      Reject Submission
                    </Button>

                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleModerateParty(party.id, "APPROVED")}
                      isLoading={processingId === party.id}
                      leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
                    >
                      Approve & Publish to Archive
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: User Management & Approvals */}
      {activeTab === "users" && (
        <div className="space-y-6">
          {/* Section A: Pending Registrations */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Pending User Registrations ({pendingUsers.length})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Office friends awaiting Sandeep&apos;s approval to log in.
                </p>
              </div>
            </div>

            {pendingUsers.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-3">No pending user registrations.</p>
            ) : (
              <div className="divide-y divide-slate-800">
                {pendingUsers.map((u) => (
                  <div
                    key={u.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <span className="font-bold text-white text-sm block">{u.name}</span>
                      <span className="text-xs text-slate-400 font-mono">
                        Mobile: {u.mobileNumber} &bull; Registered: {formatDate(u.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUserStatusChange(u.id, "ACTIVE")}
                        disabled={processingId === u.id}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approve & Activate
                      </button>

                      <button
                        onClick={() => handleUserStatusChange(u.id, "DEACTIVATED")}
                        disabled={processingId === u.id}
                        className="px-3 py-1.5 rounded-xl bg-rose-950 text-rose-300 hover:bg-rose-900 text-xs font-semibold border border-rose-500/30 transition-all flex items-center gap-1.5"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Reject / Deactivate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section B: All Registered Colleagues */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-fuchsia-400" />
                All Colleague Accounts Directory
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Sandeep can deactivate active accounts to restrict access or reactivate them.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Name</th>
                    <th className="p-3">Mobile Number</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Access Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {users.map((u) => {
                    const isAdmin = u.role === "ADMIN";

                    return (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-bold text-white">{u.name}</td>
                        <td className="p-3 font-mono text-slate-400">{u.mobileNumber}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              isAdmin
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                : "bg-slate-800 text-slate-300 border-slate-700"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3">
                          {u.status === "ACTIVE" && (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Active
                            </span>
                          )}
                          {u.status === "PENDING" && (
                            <span className="inline-flex items-center gap-1 text-amber-400 font-bold">
                              <Clock className="w-3.5 h-3.5" />
                              Pending Approval
                            </span>
                          )}
                          {u.status === "DEACTIVATED" && (
                            <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                              <Ban className="w-3.5 h-3.5" />
                              Deactivated
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {isAdmin ? (
                            <span className="text-[11px] text-amber-400 font-bold">Master Admin</span>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              {u.status === "ACTIVE" ? (
                                <button
                                  onClick={() => handleUserStatusChange(u.id, "DEACTIVATED")}
                                  disabled={processingId === u.id}
                                  className="px-2.5 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
                                >
                                  Deactivate
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUserStatusChange(u.id, "ACTIVE")}
                                  disabled={processingId === u.id}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors"
                                >
                                  Activate
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Bill Receipt Modal */}
      <Modal
        isOpen={!!inspectParty}
        onClose={() => setInspectParty(null)}
        title="Inspect Bill Screenshot"
        description="Verify authenticity, hotel tax invoice, and total amount before approval."
        maxWidth="lg"
      >
        {inspectParty && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <div>
                <strong>{inspectParty.hotelName}</strong> &bull; {inspectParty.hostName}
              </div>
              <div className="font-mono font-bold text-emerald-400 text-sm">
                {formatCurrency(inspectParty.amountSpent)}
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 max-h-[60vh] flex items-center justify-center p-2">
              <img
                src={inspectParty.billImageUrl}
                alt="Bill Screenshot"
                className="max-h-[55vh] w-auto object-contain rounded-xl"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleModerateParty(inspectParty.id, "REJECTED")}
              >
                Reject Bill
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
                onClick={() => handleModerateParty(inspectParty.id, "APPROVED")}
              >
                Approve Bill
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

