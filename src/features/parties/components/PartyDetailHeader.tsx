"use client";

import React, { useState } from "react";
import {
  Calendar,
  MapPin,
  Crown,
  IndianRupee,
  Shirt,
  Wine,
  Share2,
  Edit3,
  Trash2,
  CheckCircle,
  PlayCircle,
  XCircle,
} from "lucide-react";
import { Party, PartyStatus } from "@/types/party";
import { Badge } from "@/components/common/Badge";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/common/Button";
import { useToast } from "@/components/common/ToastContext";

interface PartyDetailHeaderProps {
  party: Party;
  isHostOrAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: PartyStatus) => void;
  onOpenAddExpense: () => void;
}

export function PartyDetailHeader({
  party,
  isHostOrAdmin,
  onEdit,
  onDelete,
  onStatusChange,
  onOpenAddExpense,
}: PartyDetailHeaderProps) {
  const { success, info } = useToast();
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const coverImage =
    party.metadata?.coverImage ||
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&auto=format&fit=crop&q=80";

  const handleShare = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      success("Link Copied!", "Share this URL with party attendees.");
    } else {
      info("Party URL", window.location.href);
    }
  };

  return (
    <div className="relative rounded-3xl bg-slate-900 border border-slate-800/80 overflow-hidden shadow-2xl">
      {/* Hero Cover Image */}
      <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-slate-950">
        <img
          src={coverImage}
          alt={party.title}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

        {/* Top Badges & Share Button */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="type" partyType={party.type} className="backdrop-blur-md shadow" />
            <Badge variant="status" status={party.status} className="backdrop-blur-md shadow" />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2.5 rounded-full bg-slate-900/80 backdrop-blur-md text-slate-200 hover:text-white hover:bg-slate-800 border border-slate-700/60 shadow transition-all active:scale-95"
              title="Share party link"
              aria-label="Share party link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {isHostOrAdmin && (
              <>
                <button
                  onClick={onEdit}
                  className="p-2.5 rounded-full bg-slate-900/80 backdrop-blur-md text-slate-200 hover:text-white hover:bg-slate-800 border border-slate-700/60 shadow transition-all active:scale-95"
                  title="Edit party details"
                  aria-label="Edit party details"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={onDelete}
                  className="p-2.5 rounded-full bg-rose-950/80 backdrop-blur-md text-rose-300 hover:text-rose-100 hover:bg-rose-900 border border-rose-700/60 shadow transition-all active:scale-95"
                  title="Delete party"
                  aria-label="Delete party"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Host Pill on Hero */}
        <div className="absolute bottom-4 left-4 sm:left-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-xs text-slate-200">
          <Crown className="w-4 h-4 text-amber-400" />
          <span>
            Hosted with pride by <strong className="text-white font-bold">{party.hostDisplayName}</strong>
          </span>
        </div>
      </div>

      {/* Main Party Information */}
      <div className="p-5 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              {party.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-fuchsia-400 shrink-0" />
                <span className="font-semibold text-slate-200">{formatDateTime(party.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-pink-400 shrink-0" />
                <span>{party.venue}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <Button
              onClick={onOpenAddExpense}
              variant="glow"
              size="md"
              leftIcon={<IndianRupee className="w-4 h-4" />}
            >
              Split Expense
            </Button>

            {isHostOrAdmin && (
              <div className="relative">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                >
                  Status: {party.status}
                </Button>

                {showStatusMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-1.5 z-20 flex flex-col gap-1">
                    {(["Upcoming", "Ongoing", "Completed", "Cancelled"] as PartyStatus[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          onStatusChange(st);
                          setShowStatusMenu(false);
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors ${
                          party.status === st
                            ? "bg-fuchsia-600 text-white"
                            : "text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        {st === "Upcoming" && <Calendar className="w-3.5 h-3.5" />}
                        {st === "Ongoing" && <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />}
                        {st === "Completed" && <CheckCircle className="w-3.5 h-3.5 text-purple-400" />}
                        {st === "Cancelled" && <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                        <span>{st}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Metadata Details Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
          {party.metadata?.estimatedBudget && (
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 shrink-0">
                <IndianRupee className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Budget</span>
                <span className="text-xs font-bold text-slate-200">
                  {formatCurrency(party.metadata.estimatedBudget)}
                </span>
              </div>
            </div>
          )}

          {party.metadata?.dressCode && (
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400 shrink-0">
                <Shirt className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Dress Code</span>
                <span className="text-xs font-bold text-slate-200 truncate block">
                  {party.metadata.dressCode}
                </span>
              </div>
            </div>
          )}

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-pink-500/15 flex items-center justify-center text-pink-400 shrink-0">
              <Wine className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Drinks Policy</span>
              <span className="text-xs font-bold text-slate-200">
                {party.metadata?.byob ? "BYOB Allowed" : "Drinks Provided"}
              </span>
            </div>
          </div>

          {party.metadata?.theme && (
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-400 shrink-0">
                <Crown className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Theme</span>
                <span className="text-xs font-bold text-slate-200 truncate block">
                  {party.metadata.theme}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Host Notes if present */}
        {party.metadata?.notes && (
          <div className="p-4 rounded-2xl bg-fuchsia-950/20 border border-fuchsia-500/20 text-xs text-slate-300 leading-relaxed">
            <strong className="text-fuchsia-400 uppercase tracking-wide block mb-1">
              Note from the Host:
            </strong>
            {party.metadata.notes}
          </div>
        )}
      </div>
    </div>
  );
}

