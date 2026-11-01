"use client";

import React, { useState } from "react";
import { Users, UserPlus, Phone, ShieldCheck } from "lucide-react";
import { PartyMember } from "@/types/party";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Modal } from "@/components/common/Modal";
import { getInitials, getAvatarColor } from "@/lib/utils";

interface PartyMembersListProps {
  partyId: string;
  members: PartyMember[];
  onAddMember: (phoneNumber: string, displayName?: string) => Promise<boolean>;
  canManage: boolean;
}

export function PartyMembersList({
  members,
  onAddMember,
  canManage,
}: PartyMembersListProps) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("+91");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      setErrorMsg("Please enter a valid phone number with country code");
      return;
    }
    setErrorMsg("");
    try {
      setIsLoading(true);
      const ok = await onAddMember(phoneNumber, displayName);
      if (ok) {
        setIsInviteOpen(false);
        setPhoneNumber("+91");
        setDisplayName("");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800/80 p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-fuchsia-400" />
          <h3 className="text-base font-bold text-slate-100">
            Party Attendees ({members.length})
          </h3>
        </div>
        {canManage && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsInviteOpen(true)}
            leftIcon={<UserPlus className="w-3.5 h-3.5 text-fuchsia-400" />}
          >
            Invite Friend
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {members.map((member) => (
          <div
            key={member.userId}
            className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/70"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${getAvatarColor(
                  member.displayName
                )}`}
              >
                {getInitials(member.displayName)}
              </div>
              <div className="min-w-0">
                <span className="text-sm font-semibold text-slate-100 truncate block">
                  {member.displayName}
                </span>
                <span className="text-xs text-slate-400 truncate block">
                  {member.phoneNumber || "Invited User"}
                </span>
              </div>
            </div>

            <Badge variant="role" role={member.role}>
              {member.role === "HOST" && <ShieldCheck className="w-3 h-3" />}
              {member.role}
            </Badge>
          </div>
        ))}
      </div>

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invite Friend to Party"
        description="Add attendee to automatically include them in the expense splitter ledger."
      >
        <form onSubmit={handleInvite} className="space-y-4 text-left">
          <Input
            label="Mobile Number (E.164)"
            placeholder="+919812345678"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            leftIcon={<Phone className="w-4 h-4" />}
            error={errorMsg}
            autoFocus
            required
          />

          <Input
            label="Display Name (Optional)"
            placeholder="e.g. Vikram Malhotra"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsInviteOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Add to Party
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

