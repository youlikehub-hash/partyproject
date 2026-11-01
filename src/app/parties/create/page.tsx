"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { partyService } from "@/features/parties/services/partyService";
import { PartyFormModal } from "@/features/parties/components/PartyFormModal";
import { CreatePartyInput } from "@/types/party";
import { useToast } from "@/components/common/ToastContext";
import { Button } from "@/components/common/Button";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

export default function CreatePartyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { success, error } = useToast();
  const [isOpen, setIsOpen] = useState(true);

  const handleCreate = async (data: CreatePartyInput): Promise<boolean> => {
    const res = await partyService.createParty(data);
    if (res.success && res.party) {
      success("Party Launched!", `'${res.party.title}' is ready.`);
      router.push(`/parties/${res.party.id}`);
      return true;
    } else {
      error("Failed", res.message || "Could not launch party");
      return false;
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Host a Celebration</h1>
          <p className="text-xs text-slate-400">Set venue, date, budget, and invite friends</p>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/15 flex items-center justify-center text-fuchsia-400 mx-auto">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-100">Ready to plan something memorable?</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          PartyPilot automatically tracks attendees, handles RSVP and calculates net expense shares so you can focus on having fun.
        </p>

        <Button variant="glow" size="lg" onClick={() => setIsOpen(true)}>
          Open Party Setup Form
        </Button>
      </div>

      <PartyFormModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          router.push("/");
        }}
        onSubmitParty={handleCreate}
        mode="create"
      />
    </div>
  );
}

