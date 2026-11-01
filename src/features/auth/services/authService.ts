import { User } from "@/types/ledger";

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: Omit<User, "password">;
  status?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: Omit<User, "password">;
}

export const authService = {
  async login(identifier: string, password: string): Promise<LoginResponse> {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });
    return res.json();
  },

  async adminLogin(username: string, password: string): Promise<any> {
    return this.login(username, password);
  },

  async sendOtp(phoneNumber: string): Promise<any> {
    const res = await fetch("/api/auth/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber }),
    });
    return res.json();
  },

  async verifyOtp(phoneNumber: string, otp: string, displayName?: string): Promise<any> {
    const res = await fetch("/api/auth/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber, otp, displayName }),
    });
    return res.json();
  },

  async register(name: string, mobileNumber: string, password: string): Promise<RegisterResponse> {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, mobileNumber, password }),
    });
    return res.json();
  },

  async getMe(): Promise<{ success: boolean; user?: Omit<User, "password">; message?: string }> {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) return { success: false };
      return res.json();
    } catch {
      return { success: false };
    }
  },

  async logout(): Promise<{ success: boolean }> {
    const res = await fetch("/api/auth/logout", { method: "POST" });
    return res.json();
  },
};
