"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { Button } from "@/components/common/Button";
import { createExpenseSchema } from "@/lib/validations/expense";
import { z } from "zod";
import { PartyMember } from "@/types/party";
import { SplitType, CreateExpenseInput } from "@/types/expense";
import { IndianRupee, Tag, Check, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type ExpenseFormData = z.infer<typeof createExpenseSchema>;

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  partyId: string;
  members: PartyMember[];
  currentUserId?: string;
  onSubmitExpense: (data: CreateExpenseInput) => Promise<boolean>;
}

const CATEGORIES = [
  "Food & Drinks",
  "Decorations",
  "Travel & Transport",
  "Venue / Stay",
  "Entertainment",
  "Other",
] as const;

export function AddExpenseModal({
  isOpen,
  onClose,
  partyId,
  members,
  currentUserId,
  onSubmitExpense,
}: AddExpenseModalProps) {
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    members.map((m) => m.userId)
  );
  const [exactAmounts, setExactAmounts] = useState<Record<string, number>>({});
  const [percentageShares, setPercentageShares] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calcError, setCalcError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      partyId,
      title: "",
      amount: undefined as unknown as number,
      category: "Food & Drinks",
      splitType: "EQUAL",
      payerId: currentUserId || members[0]?.userId || "",
      participantIds: members.map((m) => m.userId),
      notes: "",
    },
  });

  const splitType = watch("splitType") as SplitType;
  const expenseAmount = Number(watch("amount") || 0);

  const toggleParticipant = (userId: string) => {
    if (selectedParticipants.includes(userId)) {
      if (selectedParticipants.length === 1) return; // Keep at least one
      setSelectedParticipants(selectedParticipants.filter((id) => id !== userId));
    } else {
      setSelectedParticipants([...selectedParticipants, userId]);
    }
  };

  const selectAllParticipants = () => {
    setSelectedParticipants(members.map((m) => m.userId));
  };

  const handleFormSubmit = async (data: ExpenseFormData) => {
    setCalcError("");

    // Validate EXACT split total
    if (splitType === "EXACT") {
      const sum = selectedParticipants.reduce((acc, uid) => acc + (exactAmounts[uid] || 0), 0);
      if (Math.abs(sum - data.amount) > 0.05) {
        setCalcError(
          `Sum of exact amounts (${formatCurrency(sum)}) does not equal total expense (${formatCurrency(data.amount)})`
        );
        return;
      }
    }

    // Validate PERCENTAGE split total
    if (splitType === "PERCENTAGE") {
      const sum = selectedParticipants.reduce((acc, uid) => acc + (percentageShares[uid] || 0), 0);
      if (Math.abs(sum - 100) > 0.1) {
        setCalcError(`Total percentage shares must equal 100%. Current sum: ${sum}%`);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const payload: CreateExpenseInput = {
        partyId,
        title: data.title,
        amount: Number(data.amount),
        category: data.category,
        splitType,
        payerId: data.payerId,
        participantIds: selectedParticipants,
        exactAmounts: splitType === "EXACT" ? exactAmounts : undefined,
        percentageShares: splitType === "PERCENTAGE" ? percentageShares : undefined,
        notes: data.notes,
      };

      const ok = await onSubmitExpense(payload);
      if (ok) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Party Expense"
      description="Record who paid and select how to split the cost across attendees."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 text-left">
        {/* Title */}
        <Input
          label="What was this expense for?"
          placeholder="e.g. DJ sound setup, craft beer cases, villa booking"
          error={errors.title?.message}
          {...register("title")}
          autoFocus
        />

        {/* Amount & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Total Amount (₹)"
            type="number"
            step="0.01"
            placeholder="0.00"
            leftIcon={<IndianRupee className="w-4 h-4" />}
            error={errors.amount?.message}
            {...register("amount", { valueAsNumber: true })}
          />

          <Select label="Expense Category" error={errors.category?.message} {...register("category")}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-slate-900 text-slate-100">
                {c}
              </option>
            ))}
          </Select>
        </div>

        {/* Who Paid & Split Strategy */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select label="Who Paid for this?" error={errors.payerId?.message} {...register("payerId")}>
            {members.map((m) => (
              <option key={m.userId} value={m.userId} className="bg-slate-900 text-slate-100">
                {m.displayName}
              </option>
            ))}
          </Select>

          <Select label="Split Method" {...register("splitType")}>
            <option value="EQUAL" className="bg-slate-900 text-slate-100">
              Split Equally (Standard)
            </option>
            <option value="EXACT" className="bg-slate-900 text-slate-100">
              Split by Exact Amount
            </option>
            <option value="PERCENTAGE" className="bg-slate-900 text-slate-100">
              Split by Percentage (%)
            </option>
          </Select>
        </div>

        {/* Participant Selection */}
        <div className="pt-2 border-t border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-fuchsia-400" />
              Split Amongst ({selectedParticipants.length} people)
            </span>
            <button
              type="button"
              onClick={selectAllParticipants}
              className="text-xs text-fuchsia-400 hover:text-fuchsia-300 font-semibold"
            >
              Select All
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {members.map((m) => {
              const isSelected = selectedParticipants.includes(m.userId);
              const equalShare =
                expenseAmount > 0 && selectedParticipants.length > 0
                  ? Math.round((expenseAmount / selectedParticipants.length) * 100) / 100
                  : 0;

              return (
                <div
                  key={m.userId}
                  onClick={() => toggleParticipant(m.userId)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-slate-800/80 border-fuchsia-500/40 text-slate-100"
                      : "bg-slate-950/40 border-slate-800 text-slate-500 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                        isSelected
                          ? "bg-fuchsia-600 border-fuchsia-500 text-white"
                          : "border-slate-700 bg-slate-900"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span className="text-xs font-semibold">{m.displayName}</span>
                  </div>

                  {/* Share indicator or custom inputs */}
                  {isSelected && (
                    <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5">
                      {splitType === "EQUAL" && (
                        <span className="text-xs font-mono font-bold text-fuchsia-400">
                          {formatCurrency(equalShare)}
                        </span>
                      )}

                      {splitType === "EXACT" && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-400">₹</span>
                          <input
                            type="number"
                            step="0.01"
                            value={exactAmounts[m.userId] ?? ""}
                            onChange={(e) =>
                              setExactAmounts({
                                ...exactAmounts,
                                [m.userId]: parseFloat(e.target.value) || 0,
                              })
                            }
                            placeholder="0"
                            className="w-20 h-8 px-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-right font-mono"
                          />
                        </div>
                      )}

                      {splitType === "PERCENTAGE" && (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.1"
                            value={percentageShares[m.userId] ?? ""}
                            onChange={(e) =>
                              setPercentageShares({
                                ...percentageShares,
                                [m.userId]: parseFloat(e.target.value) || 0,
                              })
                            }
                            placeholder="0"
                            className="w-16 h-8 px-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-right font-mono"
                          />
                          <span className="text-xs text-slate-400">%</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {calcError && (
            <p className="text-xs font-semibold text-rose-400 p-2.5 rounded-xl bg-rose-950/20 border border-rose-500/30">
              {calcError}
            </p>
          )}
        </div>

        {/* Optional Notes */}
        <Input label="Notes (Optional)" placeholder="e.g. Paid via UPI" {...register("notes")} />

        {/* Modal Buttons */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="glow" isLoading={isSubmitting}>
            Record & Split
          </Button>
        </div>
      </form>
    </Modal>
  );
}

