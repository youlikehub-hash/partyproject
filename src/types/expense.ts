export type SplitType = "EQUAL" | "EXACT" | "PERCENTAGE";

export interface ExpenseSplit {
  userId: string;
  userDisplayName: string;
  amountOwed: number;
  percentage?: number;
  isPaid: boolean;
  paidAt?: string;
}

export interface Expense {
  id: string;
  partyId: string;
  partyTitle?: string;
  payerId: string;
  payerDisplayName: string;
  title: string;
  amount: number;
  category: "Food & Drinks" | "Decorations" | "Travel & Transport" | "Venue / Stay" | "Entertainment" | "Other";
  splitType: SplitType;
  splits: ExpenseSplit[];
  notes?: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseInput {
  partyId: string;
  title: string;
  amount: number;
  category: Expense["category"];
  splitType: SplitType;
  payerId: string;
  participantIds: string[];
  exactAmounts?: Record<string, number>;
  percentageShares?: Record<string, number>;
  notes?: string;
}

export interface DebtSettlement {
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number;
  partyId?: string;
}

export interface UserBalance {
  userId: string;
  displayName: string;
  totalPaid: number;
  totalShare: number;
  netBalance: number; // positive = owed money, negative = owes money
}

export interface LedgerSummary {
  partyId: string;
  totalExpense: number;
  expenseCount: number;
  balances: UserBalance[];
  settlements: DebtSettlement[]; // Simplified "who owes whom" transactions
}

export interface SettleTransactionInput {
  partyId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  notes?: string;
}

