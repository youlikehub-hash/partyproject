"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { authService } from "../services/authService";
import { useToast } from "@/components/common/ToastContext";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import {
  Lock,
  Smartphone,
  User,
  Shield,
  ArrowRight,
  UserPlus,
  LogIn,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";

export function AuthTabs() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingNotice, setPendingNotice] = useState<string | null>(null);

  const { refreshUser } = useAuth();
  const { success, error, warning } = useToast();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPendingNotice(null);
    if (!identifier || !password) {
      error("Missing Fields", "Please enter your Mobile Number or Username and Password.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await authService.login(identifier, password);
      if (res.success && res.user) {
        success("Welcome back!", `Logged in as ${res.user.name}`);
        await refreshUser();
        if (res.user.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else {
        if (res.status === "PENDING") {
          setPendingNotice(res.message);
          warning("Account Pending", res.message);
        } else if (res.status === "DEACTIVATED") {
          setPendingNotice(res.message);
          error("Account Deactivated", res.message);
        } else {
          error("Login Failed", res.message || "Invalid credentials.");
        }
      }
    } catch {
      error("Connection Error", "Unable to log in. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobileNumber || !regPassword) {
      error("Missing Fields", "All registration fields are required.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await authService.register(name, mobileNumber, regPassword);
      if (res.success) {
        success("Registration Submitted!", res.message);
        setPendingNotice(res.message);
        setTab("login");
        setIdentifier(mobileNumber);
        setPassword(regPassword);
      } else {
        error("Registration Failed", res.message || "Could not register user.");
      }
    } catch {
      error("Error", "Server error while registering user.");
    } finally {
      setIsLoading(false);
    }
  };

  const autoFillAccount = (id: string, pass: string) => {
    setIdentifier(id);
    setPassword(pass);
    setPendingNotice(null);
  };

  return (
    <div className="w-full space-y-5">
      {/* Tab Switcher */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
        <button
          type="button"
          onClick={() => {
            setTab("login");
            setPendingNotice(null);
          }}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all min-h-[44px] ${
            tab === "login"
              ? "bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white shadow-md shadow-fuchsia-600/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <LogIn className="w-4 h-4" />
          Colleague Login
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("register");
            setPendingNotice(null);
          }}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all min-h-[44px] ${
            tab === "register"
              ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <UserPlus className="w-4 h-4" />
          New Registration
        </button>
      </div>

      {/* Pending / Deactivated Notice Banner if triggered */}
      {pendingNotice && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200 leading-relaxed animate-in fade-in">
          <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-amber-300 font-bold mb-0.5">Account Status Notice</strong>
            {pendingNotice}
          </div>
        </div>
      )}

      {tab === "login" ? (
        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <Input
            label="Mobile Number / Admin ID"
            placeholder="e.g. 9876543210 or Admin"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            leftIcon={<Smartphone className="w-4 h-4" />}
            required
            autoFocus
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            variant="primary"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In to Party Ledger
          </Button>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <span className="text-[11px] text-slate-400 block font-semibold uppercase tracking-wider">
              Quick Test Accounts:
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => autoFillAccount("Admin", "Admin@123")}
                className="p-2 rounded-xl bg-amber-950/30 hover:bg-amber-900/40 text-amber-300 border border-amber-500/30 text-left transition-colors font-medium flex items-center justify-between"
              >
                <span>👑 Sandeep (Admin)</span>
                <span className="text-[10px] text-amber-400/80">Admin@123</span>
              </button>

              <button
                type="button"
                onClick={() => autoFillAccount("9876543210", "Admin@123")}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-left transition-colors font-medium flex items-center justify-between"
              >
                <span>✅ Rahul (Active)</span>
                <span className="text-[10px] text-slate-400">9876543210</span>
              </button>

              <button
                type="button"
                onClick={() => autoFillAccount("9823456789", "Admin@123")}
                className="p-2 rounded-xl bg-amber-950/20 hover:bg-amber-900/30 text-amber-400 border border-amber-500/20 text-left transition-colors font-medium flex items-center justify-between"
                title="Tests pending approval rejection"
              >
                <span>⏳ Amit (Pending)</span>
                <span className="text-[10px] text-amber-500">Test Block</span>
              </button>

              <button
                type="button"
                onClick={() => autoFillAccount("9834567890", "Admin@123")}
                className="p-2 rounded-xl bg-rose-950/20 hover:bg-rose-900/30 text-rose-400 border border-rose-500/20 text-left transition-colors font-medium flex items-center justify-between"
                title="Tests deactivated rejection"
              >
                <span>🚫 Vikram (Deactivated)</span>
                <span className="text-[10px] text-rose-500">Test Block</span>
              </button>
            </div>
          </div>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-4 text-left animate-in fade-in">
          <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 leading-relaxed">
            <strong className="block text-cyan-300 font-bold mb-0.5">Office Registration Workflow:</strong>
            After registering, your account status will be set to <strong>PENDING_APPROVAL</strong>.
            Sandeep will review and approve your account before you can log in.
          </div>

          <Input
            label="Full Name"
            placeholder="e.g. Ananya Roy"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
            required
            autoFocus
          />

          <Input
            label="Mobile Number"
            placeholder="e.g. 9845123456"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            leftIcon={<Smartphone className="w-4 h-4" />}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Choose a password"
            value={regPassword}
            onChange={(e) => setRegPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            variant="glow"
            isLoading={isLoading}
            rightIcon={<UserPlus className="w-4 h-4" />}
          >
            Submit Registration for Sandeep&apos;s Approval
          </Button>
        </form>
      )}
    </div>
  );
}
