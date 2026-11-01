export type Role = "USER" | "GLOBAL_ADMIN";

export interface User {
  id: string;
  phoneNumber?: string;
  username?: string;
  displayName: string;
  role: Role;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: number;
}

export interface JWTPayload {
  userId: string;
  username?: string;
  phoneNumber?: string;
  role: Role;
  displayName: string;
  iat?: number;
  exp?: number;
}

export interface SendOtpRequest {
  phoneNumber: string;
}

export interface VerifyOtpRequest {
  phoneNumber: string;
  otp: string;
  displayName?: string;
}

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  sessionToken?: string;
  testOtp?: string; // Provided for convenience in dev/testing environments
}

