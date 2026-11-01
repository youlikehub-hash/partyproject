"use client";

import React, { useState } from "react";
import { Party, PartyStatus } from "@/types/party";
import { User } from "@/types/auth";
import { Badge } from "@/components/common/Badge";
import { Modal } from "@/components/common/Modal";
import { Select } from "@/components/common/Select";
import { Button } from "@/components/common/Button";
import { formatDateTime } from "@/lib/utils";
import { Sparkles, Trash2, Edit3, ShieldAlert, ExternalLink } from "lucide-react";
import Link from "next/link";

interface GlobalPartyManagerProps {
  parties: Party[];
  users: User[];
  onOverrideParty: (data: {
    partyId: string;
    hostUserId?: string;
    status?: PartyStatus;
  }) => Promise<boolean>;
  onDeleteParty: (partyId: string) => Promise<boolean>;
}

export function GlobalPartyManager({
  parties,
  users,
  onOverrideParty,
  onDeleteParty,
}: GlobalPartyManagerProps) {
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [newHostId, setNewHostId] = useState<string>("");
  const [newStatus, setNewStatus] = useState<PartyStatus>("Upcoming");
  const [isLoading, setIsLoading] = useState(false);

  const openOverrideModal = (party: Party) => {
    setSelectedParty(party);
    setNewHostId(party.hostUserId);
    setNewStatus(party.status);
  };

  const handleSaveOverride = async () => {
    if (!selectedParty) return;
    try {
      setIsLoading(true);
      const ok = await onOverrideParty({
        partyId: selectedParty.id,
        hostUserId: newHostId,
        status: newStatus,
      });
      if (ok) {
        setSelectedParty(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 space-y-4">
      <div>
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          Global Parties Management & Host Overrides
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Sandeep (Admin) elevated control: reassign host ownership, force party status, and manage all events.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-3">Party Title</th>
              <th className="p-3">Type</th>
              <th className="p-3">Host</th>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {parties.map((p) => (
              <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="p-3">
                  <span className="font-bold text-slate-100 block">{p.title}</span>
                  <span className="text-[11px] text-slate-400 truncate max-w-xs block">
                    {p.venue}
                  </span>
                </td>
                <td className="p-3">
                  <Badge variant="type" partyType={p.type} />
                </td>
                <td className="p-3">
                  <span className="font-semibold text-amber-300">{p.hostDisplayName}</span>
                </td>
                <td className="p-3 text-slate-400">{formatDateTime(p.date)}</td>
                <td className="p-3">
                  <Badge variant="status" status={p.status} />
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      href={`/parties/${p.id}`}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                      title="View Party"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => openOverrideModal(p)}
                      className="p-1.5 text-amber-400 hover:text-amber-300 rounded-lg hover:bg-amber-500/10"
                      title="Override Host / Status"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteParty(p.id)}
                      className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-500/10"
                      title="Cascade Delete Party"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Override Modal */}
      <Modal
        isOpen={!!selectedParty}
        onClose={() => setSelectedParty(null)}
        title="Admin Override: Reassign Host / Status"
        description="Sandeep can transfer party ownership or force status transitions."
      >
        {selectedParty && (
          <div className="space-y-4 text-left">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
              Editing: <strong>{selectedParty.title}</strong>
            </div>

            <Select
              label="Assign Host (Party Owner)"
              value={newHostId}
              onChange={(e) => setNewHostId(e.target.value)}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id} className="bg-slate-900 text-slate-100">
                  {u.displayName} ({u.phoneNumber || u.username})
                </option>
              ))}
            </Select>

            <Select
              label="Party Status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as PartyStatus)}
            >
              <option value="Upcoming" className="bg-slate-900 text-slate-100">
                Upcoming
              </option>
              <option value="Ongoing" className="bg-slate-900 text-slate-100">
                Ongoing
              </option>
              <option value="Completed" className="bg-slate-900 text-slate-100">
                Completed
              </option>
              <option value="Cancelled" className="bg-slate-900 text-slate-100">
                Cancelled
              </option>
            </Select>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setSelectedParty(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="glow"
                isLoading={isLoading}
                onClick={handleSaveOverride}
              >
                Apply Admin Override
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

