import { Party, PartyStatus } from "@/types/ledger";

export const partyService = {
  async getApprovedParties(): Promise<{ success: boolean; parties: Party[]; message?: string }> {
    const res = await fetch("/api/parties?status=APPROVED", { cache: "no-store" });
    return res.json();
  },

  async getParty(id: string): Promise<any> {
    const res = await fetch(`/api/parties/${id}`, { cache: "no-store" });
    return res.json();
  },

  async updateParty(id: string, data: any): Promise<any> {
    const res = await fetch(`/api/parties/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteParty(id: string): Promise<any> {
    const res = await fetch(`/api/parties/${id}`, { method: "DELETE" });
    return res.json();
  },

  async addMember(partyId: string, phoneNumber: string, displayName?: string): Promise<any> {
    const res = await fetch(`/api/parties/${partyId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber, displayName }),
    });
    return res.json();
  },

  async createParty(data: any): Promise<any> {
    const res = await fetch("/api/parties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getAllParties(): Promise<{ success: boolean; parties: Party[]; message?: string }> {
    const res = await fetch("/api/parties?status=ALL", { cache: "no-store" });
    return res.json();
  },

  async getParties(): Promise<any> {
    return this.getAllParties();
  },

  async getPendingParties(): Promise<{ success: boolean; parties: Party[]; message?: string }> {
    const res = await fetch("/api/parties/pending", { cache: "no-store" });
    return res.json();
  },

  async submitParty(formData: FormData): Promise<{ success: boolean; party?: Party; message?: string }> {
    const res = await fetch("/api/parties", {
      method: "POST",
      body: formData,
    });
    return res.json();
  },

  async moderateParty(
    partyId: string,
    status: "APPROVED" | "REJECTED",
    adminRemarks: string
  ): Promise<{ success: boolean; party?: Party; message?: string }> {
    const res = await fetch(`/api/parties/${partyId}/moderate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminRemarks }),
    });
    return res.json();
  },
};
