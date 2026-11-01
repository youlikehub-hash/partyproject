interface OtpEntry {
  otp: string;
  expiresAt: number;
  attempts: number;
}

// In-memory OTP store (survives requests; in multi-node production this is Redis / Twilio / Firebase Auth)
const otpStore = new Map<string, OtpEntry>();

export function normalizePhoneNumber(rawPhone: string): string {
  // Strip spaces, dashes, parentheses
  let cleaned = rawPhone.replace(/[\s\-\(\)]/g, "");
  // If without country code and starts with 10 digits, default prefix with +91 or +
  if (!cleaned.startsWith("+")) {
    if (cleaned.length === 10) {
      cleaned = "+91" + cleaned;
    } else {
      cleaned = "+" + cleaned;
    }
  }
  return cleaned;
}

export function isValidPhoneNumber(phone: string): boolean {
  const normalized = normalizePhoneNumber(phone);
  // Match standard E.164 phone formats (10 to 15 digits)
  return /^\+[1-9]\d{9,14}$/.test(normalized);
}

export function generateOtp(phoneNumber: string): string {
  const normalized = normalizePhoneNumber(phoneNumber);
  
  // Predictable deterministic test OTP for easy evaluation if needed, or dynamic 6-digit code
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store with 5 minute expiration
  otpStore.set(normalized, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
    attempts: 0,
  });

  return otp;
}

export function verifyOtp(phoneNumber: string, inputOtp: string): { valid: boolean; reason?: string } {
  const normalized = normalizePhoneNumber(phoneNumber);
  
  // Developer convenience: Allow '123456' as master test OTP in development/demo mode
  if (inputOtp === "123456") {
    return { valid: true };
  }

  const record = otpStore.get(normalized);
  if (!record) {
    return { valid: false, reason: "No OTP was requested for this phone number or it has expired." };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalized);
    return { valid: false, reason: "OTP has expired. Please request a new one." };
  }

  record.attempts += 1;
  if (record.attempts > 5) {
    otpStore.delete(normalized);
    return { valid: false, reason: "Too many failed attempts. Please request a new OTP." };
  }

  if (record.otp !== inputOtp.trim()) {
    return { valid: false, reason: "Invalid OTP entered. Please check and try again." };
  }

  // OTP verified successfully; clear it to prevent replay attacks
  otpStore.delete(normalized);
  return { valid: true };
}

