"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Shield, Lock, User, ArrowRight, Sparkles } from "lucide-react";
import { adminLoginSchema } from "@/lib/validations/auth";
import { z } from "zod";
import { authService } from "../services/authService";
import { useToast } from "@/components/common/ToastContext";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { useAuth } from "../hooks/useAuth";
import { useRouter } from "next/navigation";

type AdminFormData = z.infer<typeof adminLoginSchema>;

export function AdminLoginForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { success, error } = useToast();
  const { refreshUser } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AdminFormData>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: "Admin",
      password: "Admin@123",
    },
  });

  const onSubmit = async (data: AdminFormData) => {
    try {
      setIsLoading(true);
      const res = await authService.adminLogin(data.username, data.password);
      if (res.success && res.user) {
        success("Administrator Authenticated", `Welcome back, ${res.user.displayName}! Elevated privileges granted.`);
        await refreshUser();
        router.push("/admin");
      } else {
        error("Authentication Failed", res.message || "Invalid credentials");
      }
    } catch {
      error("Error", "Server error during admin authentication");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = () => {
    setValue("username", "Admin");
    setValue("password", "Admin@123");
  };

  return (
    <div className="w-full space-y-4">
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
        <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200/90 leading-relaxed">
          <p className="font-bold text-amber-300">Elevated GLOBAL_ADMIN Console</p>
          <p className="mt-0.5">
            Full system override & audit permissions for <strong>Sandeep</strong>.
            Manage all parties, ledgers, and user accounts.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Admin Username / ID"
          placeholder="Admin"
          leftIcon={<User className="w-4 h-4" />}
          error={errors.username?.message}
          {...register("username")}
        />

        <Input
          label="Master Password"
          type="password"
          placeholder="Admin@123"
          leftIcon={<Lock className="w-4 h-4" />}
          error={errors.password?.message}
          {...register("password")}
        />

        <Button
          type="submit"
          variant="glow"
          className="w-full"
          size="lg"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Sign In as Sandeep (Admin)
        </Button>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={handleQuickFill}
            className="inline-flex items-center gap-1.5 text-xs text-amber-400/90 hover:text-amber-300 font-medium"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Auto-fill Sandeep&apos;s Default Credentials (Admin / Admin@123)
          </button>
        </div>
      </form>
    </div>
  );
}

