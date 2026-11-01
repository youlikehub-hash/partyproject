"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { Button } from "@/components/common/Button";
import { createPartySchema } from "@/lib/validations/party";
import { z } from "zod";
import { Party, PartyType, CreatePartyInput } from "@/types/party";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { User } from "@/types/auth";
import { adminService } from "@/features/admin/services/adminService";
import { Plus, Trash2, Calendar, MapPin, Sparkles } from "lucide-react";

type PartyFormData = z.infer<typeof createPartySchema>;

interface PartyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitParty: (data: CreatePartyInput) => Promise<boolean>;
  initialData?: Party | null;
  mode?: "create" | "edit";
}

const PARTY_TYPES: PartyType[] = [
  "Birthday",
  "House Party",
  "Trip",
  "Dinner",
  "Festival",
  "Bachelor Party",
  "Office Party",
  "Concert",
  "Other",
];

const DEFAULT_COVER_IMAGES: Record<PartyType, string> = {
  Birthday: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&auto=format&fit=crop&q=80",
  "House Party": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80",
  Trip: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
  Dinner: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80",
  Festival: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&auto=format&fit=crop&q=80",
  "Bachelor Party": "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=800&auto=format&fit=crop&q=80",
  "Office Party": "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80",
  Concert: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80",
  Other: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80",
};

export function PartyFormModal({
  isOpen,
  onClose,
  onSubmitParty,
  initialData,
  mode = "create",
}: PartyFormModalProps) {
  const { user, isAdmin } = useAuth();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [phoneInputs, setPhoneInputs] = useState<string[]>([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format date for datetime-local input
  const getFormattedDate = (isoString?: string) => {
    if (!isoString) {
      const d = new Date();
      d.setDate(d.getDate() + 2);
      d.setHours(20, 0, 0, 0);
      return d.toISOString().slice(0, 16);
    }
    try {
      return new Date(isoString).toISOString().slice(0, 16);
    } catch {
      return "";
    }
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PartyFormData>({
    resolver: zodResolver(createPartySchema),
    defaultValues: {
      title: initialData?.title || "",
      type: initialData?.type || "House Party",
      date: getFormattedDate(initialData?.date),
      venue: initialData?.venue || "",
      hostUserId: initialData?.hostUserId || user?.id || "",
      metadata: {
        dressCode: initialData?.metadata?.dressCode || "",
        theme: initialData?.metadata?.theme || "",
        estimatedBudget: initialData?.metadata?.estimatedBudget || 10000,
        byob: initialData?.metadata?.byob ?? true,
        notes: initialData?.metadata?.notes || "",
        coverImage: initialData?.metadata?.coverImage || DEFAULT_COVER_IMAGES["House Party"],
      },
    },
  });

  const selectedType = watch("type");

  // When type changes, auto-suggest cover image if blank
  useEffect(() => {
    if (selectedType && !initialData) {
      setValue("metadata.coverImage", DEFAULT_COVER_IMAGES[selectedType]);
    }
  }, [selectedType, setValue, initialData]);

  // Load user directory for Sandeep to reassign hosts
  useEffect(() => {
    if (isAdmin && isOpen) {
      adminService.getUsers().then((res) => {
        if (res.success && res.users) {
          setAllUsers(res.users);
        }
      });
    }
  }, [isAdmin, isOpen]);

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        type: initialData.type,
        date: getFormattedDate(initialData.date),
        venue: initialData.venue,
        hostUserId: initialData.hostUserId,
        metadata: {
          dressCode: initialData.metadata?.dressCode || "",
          theme: initialData.metadata?.theme || "",
          estimatedBudget: initialData.metadata?.estimatedBudget || 0,
          byob: initialData.metadata?.byob ?? false,
          notes: initialData.metadata?.notes || "",
          coverImage: initialData.metadata?.coverImage || "",
        },
      });
    }
  }, [initialData, reset]);

  const addPhoneField = () => {
    setPhoneInputs([...phoneInputs, ""]);
  };

  const updatePhoneField = (index: number, val: string) => {
    const updated = [...phoneInputs];
    updated[index] = val;
    setPhoneInputs(updated);
  };

  const removePhoneField = (index: number) => {
    setPhoneInputs(phoneInputs.filter((_, idx) => idx !== index));
  };

  const handleFormSubmit = async (data: PartyFormData) => {
    try {
      setIsSubmitting(true);
      const filteredPhones = phoneInputs.map((p) => p.trim()).filter((p) => p.length >= 10);

      const payload: CreatePartyInput = {
        title: data.title,
        type: data.type,
        date: new Date(data.date).toISOString(),
        venue: data.venue,
        hostUserId: data.hostUserId,
        metadata: {
          ...data.metadata,
          estimatedBudget: data.metadata?.estimatedBudget ? Number(data.metadata.estimatedBudget) : undefined,
        },
        invitedMemberPhones: filteredPhones,
      };

      const ok = await onSubmitParty(payload);
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
      title={mode === "create" ? "Host a New Party" : "Edit Party Details"}
      description="Fill in details to set up your celebration, invitations, and ledger."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 text-left">
        {/* Title */}
        <Input
          label="Party Title"
          placeholder="e.g. Neon Rooftop House Party 2026"
          error={errors.title?.message}
          {...register("title")}
          autoFocus
        />

        {/* Party Type & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select label="Party Type" error={errors.type?.message} {...register("type")}>
            {PARTY_TYPES.map((t) => (
              <option key={t} value={t} className="bg-slate-900 text-slate-100">
                {t}
              </option>
            ))}
          </Select>

          <Input
            label="Date & Time"
            type="datetime-local"
            leftIcon={<Calendar className="w-4 h-4" />}
            error={errors.date?.message}
            {...register("date")}
          />
        </div>

        {/* Venue */}
        <Input
          label="Venue / Location"
          placeholder="e.g. Skyline Terrace Penthouse, Indiranagar"
          leftIcon={<MapPin className="w-4 h-4" />}
          error={errors.venue?.message}
          {...register("venue")}
        />

        {/* Admin Host Reassignment (Only for Sandeep / GLOBAL_ADMIN) */}
        {isAdmin && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-300">
                Sandeep (Admin) Override: Assign Host
              </span>
            </div>
            <Select label="Party Host" error={errors.hostUserId?.message} {...register("hostUserId")}>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id} className="bg-slate-900 text-slate-100">
                  {u.displayName} ({u.phoneNumber || u.username})
                </option>
              ))}
            </Select>
          </div>
        )}

        {/* Metadata Details Accordion / Grid */}
        <div className="pt-2 border-t border-slate-800 space-y-3">
          <span className="text-xs font-bold text-fuchsia-400 uppercase tracking-wider block">
            Party Details & Vibes (Metadata)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Dress Code / Theme"
              placeholder="e.g. Neon Glow / Beach Casual"
              {...register("metadata.dressCode")}
            />

            <Input
              label="Estimated Budget (₹)"
              type="number"
              placeholder="e.g. 25000"
              {...register("metadata.estimatedBudget", { valueAsNumber: true })}
            />
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
            <input
              type="checkbox"
              id="byob-toggle"
              className="w-4 h-4 rounded text-fuchsia-600 focus:ring-fuchsia-500 bg-slate-800 border-slate-700"
              {...register("metadata.byob")}
            />
            <label htmlFor="byob-toggle" className="text-xs text-slate-300 font-medium cursor-pointer">
              <strong>BYOB (Bring Your Own Beverage)</strong> &bull; Attendees can bring their own drinks
            </label>
          </div>

          <Input
            label="Cover Image URL"
            placeholder="https://images.unsplash.com/..."
            error={errors.metadata?.coverImage?.message}
            {...register("metadata.coverImage")}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-300 tracking-wide uppercase mb-1">
              Host Notes / Instructions
            </label>
            <textarea
              rows={2}
              placeholder="e.g. DJ starts at 9 PM. Finger foods will be served. Parking available on 2nd basement."
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60"
              {...register("metadata.notes")}
            />
          </div>
        </div>

        {/* Invite Friends by Phone (for Create Mode) */}
        {mode === "create" && (
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Invite Friends (Phone Numbers)
              </span>
              <button
                type="button"
                onClick={addPhoneField}
                className="inline-flex items-center gap-1 text-xs text-fuchsia-400 hover:text-fuchsia-300 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Phone
              </button>
            </div>

            {phoneInputs.map((val, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="+919812345678"
                  value={val}
                  onChange={(e) => updatePhoneField(idx, e.target.value)}
                  className="flex-1 h-10 px-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
                />
                {phoneInputs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePhoneField(idx)}
                    className="p-2 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Form Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {mode === "create" ? "Launch Party" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

