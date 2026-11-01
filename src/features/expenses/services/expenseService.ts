import { Expense, CreateExpenseInput, SettleTransactionInput } from "@/types/expense";

export const expenseService = {
  async getExpenses(partyId?: string): Promise<{ success: boolean; expenses: Expense[]; message?: string }> {
    const url = partyId ? `/api/expenses?partyId=${partyId}` : "/api/expenses";
    const res = await fetch(url, { cache: "no-store" });
    return res.json();
  },

  async createExpense(
    data: CreateExpenseInput
  ): Promise<{ success: boolean; expense?: Expense; message?: string }> {
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteExpense(id: string): Promise<{ success: boolean; message?: string }> {
    const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    return res.json();
  },

  async settleDebt(
    data: SettleTransactionInput
  ): Promise<{ success: boolean; expense?: Expense; message?: string }> {
    const res = await fetch("/api/expenses/settle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};

