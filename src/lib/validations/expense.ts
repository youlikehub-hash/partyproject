import { z } from "zod";

export const splitTypeEnum = z.enum(["EQUAL", "EXACT", "PERCENTAGE"]);

export const expenseCategoryEnum = z.enum([
  "Food & Drinks",
  "Decorations",
  "Travel & Transport",
  "Venue / Stay",
  "Entertainment",
  "Other",
]);

export const createExpenseSchema = z.object({
  partyId: z.string().min(1, "Party ID is required"),
  title: z.string().min(2, "Expense title must be at least 2 characters").max(80),
  amount: z.number().positive("Amount must be greater than 0"),
  category: expenseCategoryEnum,
  splitType: splitTypeEnum,
  payerId: z.string().min(1, "Payer must be selected"),
  participantIds: z.array(z.string()).min(1, "At least one participant required"),
  exactAmounts: z.record(z.string(), z.number()).optional(),
  percentageShares: z.record(z.string(), z.number()).optional(),
  notes: z.string().max(200).optional(),
});

export const settleDebtSchema = z.object({
  partyId: z.string().min(1, "Party ID is required"),
  fromUserId: z.string().min(1, "Debtor ID is required"),
  toUserId: z.string().min(1, "Creditor ID is required"),
  amount: z.number().positive("Amount must be positive"),
  notes: z.string().optional(),
});

