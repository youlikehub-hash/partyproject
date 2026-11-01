"use client";

import React from "react";
import Link from "next/link";
import { Calendar, MapPin, Users, Crown, ArrowRight } from "lucide-react";
import { Party } from "@/types/party";
import { Badge } from "@/components/common/Badge";
import { formatDateTime } from "@/lib/utils";

export interface PartyCardProps {
  party: Party;
  isHost?: boolean;
}

export function PartyCard({ party, isHost }: PartyCardProps) {
  const coverImage =
    party.metadata?.coverImage ||
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80";

  return (
    <Link
      href={`/parties/${party.id}`}
      className="group block rounded-3xl bg-slate-900 border border-slate-800/80 overflow-hidden shadow-lg hover:shadow-2xl hover:border-fuchsia-500/40 transition-all duration-300 active:scale-[0.99]"
    >
      {/* Cover Banner */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-950">
        <img
          src={coverImage}
          alt={party.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <Badge variant="type" partyType={party.type} className="backdrop-blur-md" />
          <Badge variant="status" status={party.status} className="backdrop-blur-md" />
        </div>

        {/* Host Pill on Image */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/60 text-xs text-slate-200">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-medium truncate max-w-[150px]">
            Host: <strong className="text-white">{party.hostDisplayName}</strong>
          </span>
          {isHost && (
            <span className="ml-1 text-[10px] bg-fuchsia-500/30 text-fuchsia-300 px-1.5 py-0.2 rounded font-bold">
              You
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-100 group-hover:text-fuchsia-400 transition-colors line-clamp-1">
            {party.title}
          </h3>

          <div className="mt-2.5 space-y-1.5 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
              <span className="font-medium text-slate-300">{formatDateTime(party.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <span className="truncate">{party.venue}</span>
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 font-medium">
            <Users className="w-4 h-4 text-slate-400" />
            <span>{party.members.length} {party.members.length === 1 ? "Person" : "People"}</span>
          </div>
          <span className="inline-flex items-center gap-1 font-semibold text-fuchsia-400 group-hover:translate-x-0.5 transition-transform">
            View Ledger & Details
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

