import { z } from "zod";

export const phoneSchema = z
  .string()
  .min(10, "Phone number must be at least 10 digits")
  .max(16, "Phone number too long")
  .regex(/^[+]?[0-9\s\-()]+$/, "Invalid phone number format");

export const sendOtpSchema = z.object({
  phoneNumber: phoneSchema,
});

export const verifyOtpSchema = z.object({
  phoneNumber: phoneSchema,
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
  displayName: z.string().min(2, "Name must be at least 2 characters").optional(),
});

export const adminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

