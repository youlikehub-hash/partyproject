"use client";

import React, { useState, useRef } from "react";
import { Modal } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { Calendar, DollarSign, MapPin, Upload, FileText, Image as ImageIcon, X } from "lucide-react";
import { partyService } from "../services/partyService";
import { useToast } from "@/components/common/ToastContext";
import { Party } from "@/types/ledger";

interface PartySubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPartySubmitted: (party: Party) => void;
}

export function PartySubmissionModal({
  isOpen,
  onClose,
  onPartySubmitted,
}: PartySubmissionModalProps) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [hotelName, setHotelName] = useState("");
  const [amountSpent, setAmountSpent] = useState("");
  const [remarks, setRemarks] = useState("");
  const [billFile, setBillFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success, error } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        error("File too large", "Bill screenshot must be under 10MB.");
        return;
      }
      setBillFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeFile = () => {
    setBillFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !hotelName || !amountSpent) {
      error("Missing Information", "Date, Hotel / Venue name, and Amount are required.");
      return;
    }

    const numAmount = parseFloat(amountSpent);
    if (isNaN(numAmount) || numAmount <= 0) {
      error("Invalid Amount", "Please enter a valid expense amount.");
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("date", date);
      formData.append("hotelName", hotelName);
      formData.append("amountSpent", amountSpent);
      formData.append("remarks", remarks || "Office Party");

      if (billFile) {
        formData.append("billFile", billFile);
      }

      const res = await partyService.submitParty(formData);
      if (res.success && res.party) {
        success("Party Submitted!", res.message);
        onPartySubmitted(res.party);
        onClose();
        // Reset form
        setHotelName("");
        setAmountSpent("");
        setRemarks("");
        removeFile();
      } else {
        error("Submission Failed", res.message || "Could not submit party record.");
      }
    } catch {
      error("Network Error", "Failed to submit party to server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Office Party Expense"
      description="Record an office treat or team celebration. Sandeep will review the bill."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <Input
          label="Party Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          leftIcon={<Calendar className="w-4 h-4" />}
          required
        />

        <Input
          label="Hotel / Restaurant / Venue Name"
          placeholder="e.g. Hotel Royal Orchid, Indiranagar"
          value={hotelName}
          onChange={(e) => setHotelName(e.target.value)}
          leftIcon={<MapPin className="w-4 h-4" />}
          required
        />

        <Input
          label="Total Amount Spent (₹)"
          type="number"
          step="0.01"
          placeholder="e.g. 15000"
          value={amountSpent}
          onChange={(e) => setAmountSpent(e.target.value)}
          leftIcon={<DollarSign className="w-4 h-4" />}
          required
        />

        <div>
          <label className="block text-xs font-semibold text-slate-300 tracking-wide uppercase mb-1">
            Party Remarks / Occasion
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Q3 Sprint Release Treat, Birthday Celebration, Farewell Dinner"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700/80 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60"
          />
        </div>

        {/* Bill Receipt Upload */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300 tracking-wide uppercase">
            Bill Receipt Screenshot
          </label>

          {previewUrl ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 p-2">
              <img
                src={previewUrl}
                alt="Bill Receipt Preview"
                className="w-full max-h-48 object-contain rounded-xl"
              />
              <button
                type="button"
                onClick={removeFile}
                className="absolute top-4 right-4 p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full shadow-lg transition-transform active:scale-95"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-5 rounded-2xl border-2 border-dashed border-slate-700 hover:border-fuchsia-500/50 bg-slate-950/60 hover:bg-slate-900/60 text-center cursor-pointer transition-colors"
            >
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-200">
                Click or Tap to upload bill screenshot
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Supports JPG, PNG, WEBP (Saved locally in public/uploads)
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="glow" isLoading={isLoading}>
            Submit for Sandeep&apos;s Review
          </Button>
        </div>
      </form>
    </Modal>
  );
}

