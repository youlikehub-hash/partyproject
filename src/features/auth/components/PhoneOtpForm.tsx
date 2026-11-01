"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Smartphone, KeyRound, User, ArrowRight, RotateCw, CheckCircle2 } from "lucide-react";
import { sendOtpSchema, verifyOtpSchema } from "@/lib/validations/auth";
import { z } from "zod";
import { authService } from "../services/authService";
import { useToast } from "@/components/common/ToastContext";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { useAuth } from "../hooks/useAuth";
import { useRouter } from "next/navigation";

type SendFormData = z.infer<typeof sendOtpSchema>;
type VerifyFormData = z.infer<typeof verifyOtpSchema>;

export function PhoneOtpForm() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [testOtp, setTestOtp] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const { success, error, info } = useToast();
  const { refreshUser } = useAuth();
  const router = useRouter();

  // Step 1 Form
  const {
    register: registerPhone,
    handleSubmit: handlePhoneSubmit,
    formState: { errors: phoneErrors },
  } = useForm<SendFormData>({
    resolver: zodResolver(sendOtpSchema),
    defaultValues: { phoneNumber: "+919876543210" },
  });

  // Step 2 Form
  const {
    register: registerOtp,
    handleSubmit: handleOtpSubmit,
    setValue: setOtpValue,
    formState: { errors: otpErrors },
  } = useForm<VerifyFormData>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { phoneNumber: "", otp: "", displayName: "" },
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const onSendOtp = async (data: SendFormData) => {
    try {
      setIsSending(true);
      const res = await authService.sendOtp(data.phoneNumber);
      if (res.success) {
        setPhoneNumber(data.phoneNumber);
        setOtpValue("phoneNumber", data.phoneNumber);
        setTestOtp(res.testOtp || "123456");
        setStep("otp");
        setCountdown(45);
        success("OTP Dispatched", res.message);
      } else {
        error("Failed to Send OTP", res.message);
      }
    } catch {
      error("Network Error", "Unable to send verification code. Please check your connection.");
    } finally {
      setIsSending(false);
    }
  };

  const onVerifyOtp = async (data: VerifyFormData) => {
    try {
      setIsVerifying(true);
      const res = await authService.verifyOtp(phoneNumber, data.otp, data.displayName);
      if (res.success && res.user) {
        success("Welcome to PartyPilot!", `Logged in as ${res.user.displayName}`);
        await refreshUser();
        router.push("/");
      } else {
        error("Verification Failed", res.message || "Invalid OTP code");
      }
    } catch {
      error("Error", "Failed to verify OTP code.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || !phoneNumber) return;
    await onSendOtp({ phoneNumber });
  };

  return (
    <div className="w-full">
      {step === "phone" ? (
        <form onSubmit={handlePhoneSubmit(onSendOtp)} className="space-y-4">
          <div>
            <Input
              label="Mobile Number"
              placeholder="+919876543210"
              leftIcon={<Smartphone className="w-4 h-4" />}
              error={phoneErrors.phoneNumber?.message}
              {...registerPhone("phoneNumber")}
              autoFocus
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              Enter with country code (e.g., +91 for India). A 6-digit verification code will be sent.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isSending}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Send OTP Code
          </Button>

          {/* Quick preset mobile numbers for easy testing */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[11px] text-slate-400 block mb-2 font-medium">Quick Demo Numbers:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: "Rahul (+919876543210)", val: "+919876543210" },
                { name: "Priya (+919812345678)", val: "+919812345678" },
                { name: "Amit (+919823456789)", val: "+919823456789" },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => onSendOtp({ phoneNumber: item.val })}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </form>
      ) : (
        <form onSubmit={handleOtpSubmit(onVerifyOtp)} className="space-y-4 animate-in fade-in duration-200">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-fuchsia-400" />
              <span className="text-xs font-medium text-slate-300">{phoneNumber}</span>
            </div>
            <button
              type="button"
              onClick={() => setStep("phone")}
              className="text-xs text-fuchsia-400 hover:underline font-semibold"
            >
              Change
            </button>
          </div>

          {testOtp && (
            <div className="p-3 rounded-xl bg-fuchsia-950/40 border border-fuchsia-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-fuchsia-300">
                <CheckCircle2 className="w-4 h-4 text-fuchsia-400 shrink-0" />
                <span>
                  Demo OTP: <strong className="text-white text-sm tracking-wider font-mono">{testOtp}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOtpValue("otp", testOtp)}
                className="px-2 py-0.5 text-[11px] font-semibold bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-md transition-colors"
              >
                Auto Fill
              </button>
            </div>
          )}

          <div>
            <Input
              label="6-Digit Verification Code"
              placeholder="e.g. 123456"
              maxLength={6}
              leftIcon={<KeyRound className="w-4 h-4" />}
              error={otpErrors.otp?.message}
              {...registerOtp("otp")}
              className="tracking-widest font-mono text-center text-lg"
              autoFocus
            />
          </div>

          <div>
            <Input
              label="Your Display Name (Optional for new users)"
              placeholder="e.g. Rahul Sharma"
              leftIcon={<User className="w-4 h-4" />}
              error={otpErrors.displayName?.message}
              {...registerOtp("displayName")}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isVerifying}
            rightIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Verify & Continue
          </Button>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>Didn&apos;t get the code?</span>
            <button
              type="button"
              disabled={countdown > 0}
              onClick={handleResend}
              className="flex items-center gap-1 font-semibold text-fuchsia-400 disabled:text-slate-600 hover:underline"
            >
              <RotateCw className={`w-3.5 h-3.5 ${countdown > 0 ? "animate-spin" : ""}`} />
              {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

