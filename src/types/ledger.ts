export type UserRole = "ADMIN" | "USER" | "GLOBAL_ADMIN";
export type UserStatus = "PENDING" | "ACTIVE" | "DEACTIVATED";
export type PartyStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface User {
  id: string;
  mobileNumber: string;
  password?: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface Party {
  id: string;
  hostId: string;
  hostName: string;
  date: string;
  hotelName: string;
  amountSpent: number;
  remarks: string;
  billImageUrl: string;
  status: PartyStatus;
  adminRemarks?: string;
  createdAt: string;
  updatedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface DatabaseSchema {
  users: User[];
  parties: Party[];
}

export interface AuthSession {
  user: Omit<User, "password">;
  token: string;
}
