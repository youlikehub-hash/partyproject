export type AuditAction =
  | "USER_REGISTERED"
  | "USER_LOGIN"
  | "ADMIN_LOGIN"
  | "PARTY_CREATED"
  | "PARTY_UPDATED"
  | "PARTY_DELETED"
  | "PARTY_STATUS_CHANGED"
  | "HOST_OVERRIDDEN"
  | "EXPENSE_ADDED"
  | "EXPENSE_UPDATED"
  | "EXPENSE_DELETED"
  | "DEBT_SETTLED"
  | "ADMIN_USER_TOGGLED";

export interface AuditLog {
  id: string;
  userId?: string;
  userName?: string;
  role?: string;
  action: AuditAction;
  resource: "USER" | "PARTY" | "EXPENSE" | "LEDGER" | "AUTH" | "SYSTEM";
  resourceId?: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalParties: number;
  activeParties: number;
  totalExpensesAmount: number;
  totalTransactions: number;
  auditLogsCount: number;
}

