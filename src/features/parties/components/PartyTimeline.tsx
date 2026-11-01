"use client";

import React, { useState } from "react";
import { Party, PartyStatus } from "@/types/ledger";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Calendar,
  MapPin,
  User,
  Search,
  Receipt,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  DollarSign,
  TrendingUp,
  PartyPopper,
  Eye,
  Shield,
  Layers,
  Sparkles,
} from "lucide-react";
import { Modal } from "@/components/common/Modal";
import Link from "next/link";

interface PartyTimelineProps {
  parties: Party[];
  onOpenSubmitModal?: () => void;
  canSubmit?: boolean;
  isAdmin?: boolean;
}

type TabType = "ALL" | "PENDING" | "APPROVED";

export function PartyTimeline({
  parties,
  onOpenSubmitModal,
  canSubmit,
  isAdmin,
}: PartyTimelineProps) {
  const [activeTab, setActiveTab] = useState<TabType>("ALL");
  const [search, setSearch] = useState("");
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);
  const [detailedParty, setDetailedParty] = useState<Party | null>(null);

  // Counts for each section
  const totalCount = parties.length;
  const pendingCount = parties.filter((p) => p.status === "PENDING").length;
  const approvedCount = parties.filter((p) => p.status === "APPROVED").length;

  // Filter based on active section
  const sectionParties = parties.filter((p) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "PENDING") return p.status === "PENDING";
    if (activeTab === "APPROVED") return p.status === "APPROVED";
    return true;
  });

  // Filter based on search keywords
  const filteredParties = sectionParties.filter(
    (p) =>
      p.hotelName.toLowerCase().includes(search.toLowerCase()) ||
      p.hostName.toLowerCase().includes(search.toLowerCase()) ||
      p.remarks.toLowerCase().includes(search.toLowerCase())
  );

  // Metrics calculations
  const totalSpentAll = parties.reduce((sum, p) => sum + p.amountSpent, 0);
  const totalSpentApproved = parties
    .filter((p) => p.status === "APPROVED")
    .reduce((sum, p) => sum + p.amountSpent, 0);
  const avgSpentApproved =
    approvedCount > 0 ? Math.round(totalSpentApproved / approvedCount) : 0;
  const totalSpentPending = parties
    .filter((p) => p.status === "PENDING")
    .reduce((sum, p) => sum + p.amountSpent, 0);

  return (
    <div className="space-y-6">
      {/* Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider block">
              {activeTab === "PENDING"
                ? "Pending Spend to Verify"
                : activeTab === "APPROVED"
                ? "Total Approved Spend"
                : "Total Combined Party Spend"}
            </span>
            <span className="text-2xl font-black text-white mt-1 block">
              {formatCurrency(
                activeTab === "PENDING"
                  ? totalSpentPending
                  : activeTab === "APPROVED"
                  ? totalSpentApproved
                  : totalSpentAll
              )}
            </span>
            <span className="text-[11px] text-emerald-400 mt-0.5 block">
              {activeTab === "PENDING"
                ? `${pendingCount} bill(s) awaiting Sandeep`
                : `${approvedCount} approved celebrations`}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider block">
              {activeTab === "PENDING"
                ? "Pending for Approval"
                : activeTab === "APPROVED"
                ? "Approved Celebrations"
                : "Total Parties Logged"}
            </span>
            <span className="text-2xl font-black text-white mt-1 block">
              {activeTab === "PENDING"
                ? pendingCount
                : activeTab === "APPROVED"
                ? approvedCount
                : totalCount}
            </span>
            <span className="text-[11px] text-fuchsia-400 mt-0.5 block">
              Documented with bill receipts
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/15 flex items-center justify-center text-fuchsia-400">
            <PartyPopper className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider block">
              Average Approved Spend
            </span>
            <span className="text-2xl font-black text-white mt-1 block">
              {formatCurrency(avgSpentApproved)}
            </span>
            <span className="text-[11px] text-cyan-400 mt-0.5 block">
              Per verified celebration
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 flex items-center justify-center text-cyan-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Section Tabs: First is All, Second is Pending for Approval, Third is Approved */}
      <div className="bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 flex flex-wrap sm:flex-nowrap gap-1.5 shadow-lg">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "ALL"
              ? "bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white shadow-md shadow-fuchsia-600/20"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Parties</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
              activeTab === "ALL"
                ? "bg-white/20 text-white"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            {totalCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("PENDING")}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "PENDING"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pending for Approval</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
              activeTab === "PENDING"
                ? "bg-slate-950/20 text-slate-950"
                : pendingCount > 0
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            {pendingCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("APPROVED")}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === "APPROVED"
              ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Approved Celebrations</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
              activeTab === "APPROVED"
                ? "bg-slate-950/20 text-slate-950"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            {approvedCount}
          </span>
        </button>
      </div>

      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder={`Search ${
              activeTab === "ALL"
                ? "all parties"
                : activeTab === "PENDING"
                ? "pending approvals"
                : "approved parties"
            } by hotel, host, or remarks...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
          />
        </div>

        {canSubmit && (
          <button
            onClick={onOpenSubmitModal}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-fuchsia-600/30 transition-all active:scale-95 flex items-center justify-center gap-2 min-h-[44px]"
          >
            <PartyPopper className="w-4 h-4" />
            Submit New Party
          </button>
        )}
      </div>

      {/* Timeline List */}
      {filteredParties.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/60 border border-slate-800">
          <Receipt className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-200">
            {search
              ? "No Parties Matched Search"
              : activeTab === "PENDING"
              ? "No Pending Approvals"
              : activeTab === "APPROVED"
              ? "No Approved Parties Yet"
              : "No Parties Found"}
          </h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {search
              ? "Try adjusting your search keywords."
              : activeTab === "PENDING"
              ? "All submitted parties have been verified and processed by Sandeep!"
              : activeTab === "APPROVED"
              ? "Parties will appear here once Sandeep reviews and approves them."
              : "No parties have been logged yet. Active colleagues can submit one above!"}
          </p>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-800/80 space-y-6">
          {filteredParties.map((party) => {
            const isApproved = party.status === "APPROVED";
            const isPending = party.status === "PENDING";
            const isRejected = party.status === "REJECTED";

            return (
              <div key={party.id} className="relative group">
                {/* Timeline marker icon */}
                <div
                  className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-7 h-7 rounded-full bg-slate-900 border-2 flex items-center justify-center shadow-md ${
                    isApproved
                      ? "border-emerald-500 text-emerald-400"
                      : isPending
                      ? "border-amber-500 text-amber-400 animate-pulse"
                      : "border-rose-500 text-rose-400"
                  }`}
                >
                  {isApproved ? (
                    <PartyPopper className="w-3.5 h-3.5" />
                  ) : isPending ? (
                    <Clock className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800/90 hover:border-slate-700/80 transition-all shadow-xl space-y-4">
                  {/* Header: Date, Status Badge & Amount */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                        <Calendar className="w-4 h-4 text-fuchsia-400" />
                        <span>{formatDate(party.date)}</span>
                      </div>

                      {/* Status Badges */}
                      {isApproved && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          Approved
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-semibold animate-pulse">
                          <Clock className="w-3 h-3" />
                          Pending Approval
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[11px] font-semibold">
                          <XCircle className="w-3 h-3" />
                          Rejected
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 uppercase font-semibold">
                        Total Spent:
                      </span>
                      <span
                        className={`text-lg sm:text-xl font-black font-mono ${
                          isApproved
                            ? "text-emerald-400"
                            : isPending
                            ? "text-amber-400"
                            : "text-slate-400"
                        }`}
                      >
                        {formatCurrency(party.amountSpent)}
                      </span>
                    </div>
                  </div>

                  {/* Hotel & Host info */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 text-xs font-bold text-fuchsia-300">
                        <User className="w-3.5 h-3.5" />
                        <span>Party Given by: {party.hostName}</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-white flex items-center gap-2 pt-1">
                      <MapPin className="w-4 h-4 text-pink-400 shrink-0" />
                      <span>{party.hotelName}</span>
                    </h3>

                    {party.remarks && (
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1 line-clamp-2">
                        &quot;{party.remarks}&quot;
                      </p>
                    )}
                  </div>

                  {/* Actions & Verification Remarks */}
                  <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* View Details Button */}
                      <button
                        onClick={() => setDetailedParty(party)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-fuchsia-600/15 hover:bg-fuchsia-600/25 border border-fuchsia-500/30 text-xs font-bold text-fuchsia-300 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Party Details</span>
                      </button>

                      {/* View Bill Receipt Button */}
                      {party.billImageUrl && (
                        <button
                          onClick={() => setSelectedReceiptUrl(party.billImageUrl)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                        >
                          <Receipt className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Bill Receipt</span>
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </button>
                      )}
                    </div>

                    {party.adminRemarks && (
                      <div className="text-xs text-amber-300/90 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 max-w-md">
                        <strong>Sandeep&apos;s Note:</strong> {party.adminRemarks}
                      </div>
                    )}

                    {isPending && isAdmin && (
                      <Link
                        href="/admin"
                        className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/30"
                      >
                        <Shield className="w-3 h-3" />
                        Moderate in Admin &rarr;
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Complete Party Details Modal */}
      <Modal
        isOpen={!!detailedParty}
        onClose={() => setDetailedParty(null)}
        title="Complete Party Details"
        description="Comprehensive expense and verification record from local storage."
        maxWidth="lg"
      >
        {detailedParty && (
          <div className="space-y-5">
            {/* Main Header Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-fuchsia-400" />
                  Date of Party: {formatDate(detailedParty.date)}
                </span>

                {detailedParty.status === "APPROVED" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified & Approved
                  </span>
                )}
                {detailedParty.status === "PENDING" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold animate-pulse">
                    <Clock className="w-3.5 h-3.5" />
                    Pending Sandeep&apos;s Approval
                  </span>
                )}
                {detailedParty.status === "REJECTED" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-bold">
                    <XCircle className="w-3.5 h-3.5" />
                    Rejected by Admin
                  </span>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">
                    Amount Spent
                  </span>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    {formatCurrency(detailedParty.amountSpent)}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">
                    Party Given By
                  </span>
                  <div className="text-base font-bold text-white flex items-center gap-1.5 justify-end">
                    <User className="w-4 h-4 text-fuchsia-400" />
                    {detailedParty.hostName}
                  </div>
                </div>
              </div>
            </div>

            {/* Venue / Hotel & Remarks */}
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">
                  Hotel / Venue
                </span>
                <p className="text-base font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-pink-400 shrink-0" />
                  {detailedParty.hotelName}
                </p>
              </div>

              {detailedParty.remarks && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">
                    Occasion / Remarks
                  </span>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    &quot;{detailedParty.remarks}&quot;
                  </p>
                </div>
              )}

              {detailedParty.adminRemarks && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
                  <span className="text-[11px] uppercase font-bold text-amber-300 block mb-1">
                    Sandeep&apos;s Verification Remarks
                  </span>
                  <p className="text-xs sm:text-sm">{detailedParty.adminRemarks}</p>
                </div>
              )}
            </div>

            {/* Bill Receipt Preview */}
            {detailedParty.billImageUrl && (
              <div className="space-y-2">
                <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                  Bill Receipt Screenshot
                </span>
                <div
                  onClick={() => setSelectedReceiptUrl(detailedParty.billImageUrl)}
                  className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 p-2 cursor-pointer group hover:border-slate-700 transition-colors relative"
                >
                  <img
                    src={detailedParty.billImageUrl}
                    alt="Bill Receipt"
                    className="max-h-52 w-full object-contain rounded-xl"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-2xl">
                    <span className="px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Click to Enlarge
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Footer / Meta */}
            <div className="pt-2 text-right">
              <button
                onClick={() => setDetailedParty(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Bill Receipt Zoom Modal */}
      <Modal
        isOpen={!!selectedReceiptUrl}
        onClose={() => setSelectedReceiptUrl(null)}
        title="Bill Receipt Verification"
        description="Original uploaded receipt copy saved in local storage."
        maxWidth="lg"
      >
        {selectedReceiptUrl && (
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 max-h-[70vh] flex items-center justify-center p-2">
              <img
                src={selectedReceiptUrl}
                alt="Bill Receipt Screenshot"
                className="max-h-[65vh] w-auto object-contain rounded-xl"
              />
            </div>
            <div className="text-right">
              <a
                href={selectedReceiptUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-fuchsia-400 hover:underline font-semibold"
              >
                Open full resolution in new tab &rarr;
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
