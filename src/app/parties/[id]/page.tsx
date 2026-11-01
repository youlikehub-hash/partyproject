"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { partyService } from "@/features/parties/services/partyService";
import { expenseService } from "@/features/expenses/services/expenseService";
import { Party, PartyStatus, UpdatePartyInput } from "@/types/party";
import { Expense, LedgerSummary, CreateExpenseInput, SettleTransactionInput } from "@/types/expense";
import { PartyDetailHeader } from "@/features/parties/components/PartyDetailHeader";
import { PartyMembersList } from "@/features/parties/components/PartyMembersList";
import { PartyFormModal } from "@/features/parties/components/PartyFormModal";
import { ExpenseList } from "@/features/expenses/components/ExpenseList";
import { AddExpenseModal } from "@/features/expenses/components/AddExpenseModal";
import { LedgerSplitterView } from "@/features/expenses/components/LedgerSplitterView";
import { useToast } from "@/components/common/ToastContext";
import { Receipt, Users, Calculator, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function PartyDetailPage() {
  const params = useParams();
  const partyId = params.id as string;
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const { success, error } = useToast();

  const [party, setParty] = useState<Party | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [ledger, setLedger] = useState<LedgerSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"ledger" | "expenses" | "attendees">("ledger");
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchPartyDetails = useCallback(async () => {
    if (!partyId) return;
    try {
      setIsLoading(true);
      const res = await partyService.getParty(partyId);
      if (res.success && res.party) {
        setParty(res.party);
        setExpenses(res.expenses || []);
        setLedger(res.ledger || null);
      } else {
        error("Party Not Found", res.message || "Could not retrieve party details.");
        router.push("/");
      }
    } catch {
      error("Error", "Network error retrieving party.");
    } finally {
      setIsLoading(false);
    }
  }, [partyId, error, router]);

  useEffect(() => {
    fetchPartyDetails();
  }, [fetchPartyDetails]);

  const isHostOrAdmin = Boolean(
    isAdmin || (user && party && party.hostUserId === user.id)
  );

  const handleStatusChange = async (newStatus: PartyStatus) => {
    if (!party) return;
    const res = await partyService.updateParty(party.id, { status: newStatus });
    if (res.success && res.party) {
      setParty(res.party);
      success("Status Updated", `Party status set to ${newStatus}`);
    } else {
      error("Update Failed", res.message);
    }
  };

  const handleUpdateParty = async (data: UpdatePartyInput): Promise<boolean> => {
    if (!party) return false;
    const res = await partyService.updateParty(party.id, data);
    if (res.success && res.party) {
      setParty(res.party);
      success("Party Updated", "Changes saved successfully.");
      return true;
    } else {
      error("Update Failed", res.message);
      return false;
    }
  };

  const handleDeleteParty = async () => {
    if (!party) return;
    if (!window.confirm(`Are you sure you want to delete '${party.title}'? This action cannot be undone.`)) {
      return;
    }
    const res = await partyService.deleteParty(party.id);
    if (res.success) {
      success("Party Deleted", "Party removed successfully.");
      router.push("/");
    } else {
      error("Delete Failed", res.message);
    }
  };

  const handleAddMember = async (phoneNumber: string, displayName?: string): Promise<boolean> => {
    if (!party) return false;
    const res = await partyService.addMember(party.id, phoneNumber, displayName);
    if (res.success && res.party) {
      setParty(res.party);
      success("Member Invited", res.message);
      fetchPartyDetails(); // recompute ledger with new member
      return true;
    } else {
      error("Failed to add member", res.message);
      return false;
    }
  };

  const handleAddExpense = async (data: CreateExpenseInput): Promise<boolean> => {
    const res = await expenseService.createExpense(data);
    if (res.success && res.expense) {
      success("Expense Recorded", `Added ${data.title} (${res.expense.amount})`);
      await fetchPartyDetails(); // reload expenses and recalculate ledger
      return true;
    } else {
      error("Failed to add expense", res.message);
      return false;
    }
  };

  const handleDeleteExpense = async (expenseId: string): Promise<boolean> => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return false;
    const res = await expenseService.deleteExpense(expenseId);
    if (res.success) {
      success("Expense Removed", "Ledger updated successfully.");
      await fetchPartyDetails();
      return true;
    } else {
      error("Delete Failed", res.message);
      return false;
    }
  };

  const handleSettleDebt = async (input: SettleTransactionInput): Promise<boolean> => {
    const res = await expenseService.settleDebt(input);
    if (res.success) {
      success("Settlement Recorded", "Dues reconciled and updated in ledger!");
      await fetchPartyDetails();
      return true;
    } else {
      error("Settlement Failed", res.message);
      return false;
    }
  };

  if (isLoading || !party) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-fuchsia-500 animate-spin" />
        <p className="text-sm font-medium text-slate-400">Loading party ledger...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Parties
        </Link>
      </div>

      {/* Hero Header */}
      <PartyDetailHeader
        party={party}
        isHostOrAdmin={isHostOrAdmin}
        onEdit={() => setIsEditOpen(true)}
        onDelete={handleDeleteParty}
        onStatusChange={handleStatusChange}
        onOpenAddExpense={() => setIsAddExpenseOpen(true)}
      />

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("ledger")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap min-h-[44px] ${
            activeTab === "ledger"
              ? "bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white shadow-md shadow-fuchsia-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Calculator className="w-4 h-4" />
          Who Owes Whom & Ledger
        </button>

        <button
          onClick={() => setActiveTab("expenses")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap min-h-[44px] ${
            activeTab === "expenses"
              ? "bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white shadow-md shadow-fuchsia-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Receipt className="w-4 h-4" />
          All Expenses ({expenses.length})
        </button>

        <button
          onClick={() => setActiveTab("attendees")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap min-h-[44px] ${
            activeTab === "attendees"
              ? "bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white shadow-md shadow-fuchsia-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Users className="w-4 h-4" />
          Attendees ({party.members.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "ledger" && ledger && (
        <LedgerSplitterView
          ledger={ledger}
          onSettleDebt={handleSettleDebt}
          currentUserId={user?.id}
          isHostOrAdmin={isHostOrAdmin}
        />
      )}

      {activeTab === "expenses" && (
        <ExpenseList
          expenses={expenses}
          currentUserId={user?.id}
          isHostOrAdmin={isHostOrAdmin}
          onDeleteExpense={handleDeleteExpense}
        />
      )}

      {activeTab === "attendees" && (
        <PartyMembersList
          partyId={party.id}
          members={party.members}
          onAddMember={handleAddMember}
          canManage={isHostOrAdmin}
        />
      )}

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        partyId={party.id}
        members={party.members}
        currentUserId={user?.id}
        onSubmitExpense={handleAddExpense}
      />

      {/* Edit Party Modal */}
      <PartyFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialData={party}
        onSubmitParty={handleUpdateParty}
        mode="edit"
      />
    </div>
  );
}

