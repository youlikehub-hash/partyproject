import { User, UserStatus } from "@/types/ledger";

export const userService = {
  async getAllUsers(): Promise<{ success: boolean; users?: Omit<User, "password">[]; message?: string }> {
    const res = await fetch("/api/users", { cache: "no-store" });
    return res.json();
  },

  async updateStatus(
    userId: string,
    status: UserStatus
  ): Promise<{ success: boolean; user?: Omit<User, "password">; message?: string }> {
    const res = await fetch(`/api/users/${userId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    return res.json();
  },
};

