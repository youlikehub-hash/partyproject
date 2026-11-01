import { SystemMetrics, AuditLog } from "@/types/audit";
import { User } from "@/types/auth";
import { Party } from "@/types/party";

export const adminService = {
  async getStats(): Promise<{ success: boolean; metrics?: SystemMetrics; message?: string }> {
    const res = await fetch("/api/admin/stats", { cache: "no-store" });
    return res.json();
  },

  async getUsers(): Promise<{ success: boolean; users?: User[]; message?: string }> {
    const res = await fetch("/api/admin/users", { cache: "no-store" });
    return res.json();
  },

  async toggleUser(userId: string): Promise<{ success: boolean; user?: User; message?: string }> {
    const res = await fetch("/api/admin/users/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    return res.json();
  },

  async getAuditLogs(): Promise<{ success: boolean; logs?: AuditLog[]; message?: string }> {
    const res = await fetch("/api/admin/audit-logs", { cache: "no-store" });
    return res.json();
  },

  async overrideParty(data: {
    partyId: string;
    hostUserId?: string;
    status?: Party["status"];
    title?: string;
    venue?: string;
  }): Promise<{ success: boolean; party?: Party; message?: string }> {
    const res = await fetch("/api/admin/override/party", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};

