import { Expense, ExpenseSplit, LedgerSummary, UserBalance, DebtSettlement, SplitType } from "@/types/expense";
import { PartyMember } from "@/types/party";

/**
 * Computes splits based on the selected split type
 */
export function calculateSplits(
  amount: number,
  participants: { userId: string; displayName: string }[],
  splitType: SplitType,
  exactAmounts?: Record<string, number>,
  percentages?: Record<string, number>
): ExpenseSplit[] {
  if (participants.length === 0) return [];

  const roundTwoDecimals = (val: number) => Math.round((val + Number.EPSILON) * 100) / 100;

  if (splitType === "EQUAL") {
    const count = participants.length;
    const baseShare = Math.floor((amount / count) * 100) / 100;
    let remainder = roundTwoDecimals(amount - baseShare * count);

    return participants.map((p, idx) => {
      // distribute leftover cents to the first few participants
      let share = baseShare;
      if (remainder > 0.009) {
        share = roundTwoDecimals(share + 0.01);
        remainder = roundTwoDecimals(remainder - 0.01);
      }
      return {
        userId: p.userId,
        userDisplayName: p.displayName,
        amountOwed: share,
        percentage: roundTwoDecimals((share / amount) * 100),
        isPaid: false,
      };
    });
  }

  if (splitType === "EXACT" && exactAmounts) {
    return participants.map((p) => {
      const share = exactAmounts[p.userId] || 0;
      return {
        userId: p.userId,
        userDisplayName: p.displayName,
        amountOwed: roundTwoDecimals(share),
        percentage: amount > 0 ? roundTwoDecimals((share / amount) * 100) : 0,
        isPaid: false,
      };
    });
  }

  if (splitType === "PERCENTAGE" && percentages) {
    return participants.map((p) => {
      const pct = percentages[p.userId] || 0;
      const share = roundTwoDecimals((amount * pct) / 100);
      return {
        userId: p.userId,
        userDisplayName: p.displayName,
        amountOwed: share,
        percentage: pct,
        isPaid: false,
      };
    });
  }

  // Fallback to equal split
  return calculateSplits(amount, participants, "EQUAL");
}

/**
 * Computes net balances and optimal settlement transactions ("who owes whom")
 */
export function calculatePartyLedger(
  partyId: string,
  members: PartyMember[],
  expenses: Expense[]
): LedgerSummary {
  // Map to accumulate user financial metrics
  const userStats = new Map<
    string,
    { displayName: string; totalPaid: number; totalShare: number }
  >();

  // Initialize with all party members so everyone appears on ledger
  for (const member of members) {
    userStats.set(member.userId, {
      displayName: member.displayName,
      totalPaid: 0,
      totalShare: 0,
    });
  }

  let totalExpenseAmount = 0;

  // Process all recorded expenses
  for (const exp of expenses) {
    totalExpenseAmount += exp.amount;

    // Track payer
    if (!userStats.has(exp.payerId)) {
      userStats.set(exp.payerId, {
        displayName: exp.payerDisplayName,
        totalPaid: 0,
        totalShare: 0,
      });
    }
    const payer = userStats.get(exp.payerId)!;
    payer.totalPaid += exp.amount;

    // Track shares
    for (const split of exp.splits) {
      if (!userStats.has(split.userId)) {
        userStats.set(split.userId, {
          displayName: split.userDisplayName,
          totalPaid: 0,
          totalShare: 0,
        });
      }
      const participant = userStats.get(split.userId)!;
      participant.totalShare += split.amountOwed;
    }
  }

  // Calculate net balances: netBalance = totalPaid - totalShare
  const balances: UserBalance[] = [];
  userStats.forEach((data, userId) => {
    const net = Math.round((data.totalPaid - data.totalShare) * 100) / 100;
    balances.push({
      userId,
      displayName: data.displayName,
      totalPaid: Math.round(data.totalPaid * 100) / 100,
      totalShare: Math.round(data.totalShare * 100) / 100,
      netBalance: net,
    });
  });

  // Sort by net balance descending (creditors first, debtors last)
  balances.sort((a, b) => b.netBalance - a.netBalance);

  // Run Debt Simplification Graph Algorithm
  const settlements = simplifyDebts(balances, partyId);

  return {
    partyId,
    totalExpense: Math.round(totalExpenseAmount * 100) / 100,
    expenseCount: expenses.length,
    balances,
    settlements,
  };
}

/**
 * Greedy Debt Simplification Algorithm
 * Matches biggest debtors with biggest creditors to minimize overall transaction count.
 */
function simplifyDebts(balances: UserBalance[], partyId: string): DebtSettlement[] {
  interface Account {
    userId: string;
    displayName: string;
    balance: number;
  }

  // Debtors have negative balance (they owe money)
  const debtors: Account[] = [];
  // Creditors have positive balance (they are owed money)
  const creditors: Account[] = [];

  for (const b of balances) {
    if (b.netBalance < -0.01) {
      debtors.push({ userId: b.userId, displayName: b.displayName, balance: Math.abs(b.netBalance) });
    } else if (b.netBalance > 0.01) {
      creditors.push({ userId: b.userId, displayName: b.displayName, balance: b.netBalance });
    }
  }

  // Sort debtors & creditors in descending order of amounts
  debtors.sort((a, b) => b.balance - a.balance);
  creditors.sort((a, b) => b.balance - a.balance);

  const settlements: DebtSettlement[] = [];

  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const amount = Math.min(debtor.balance, creditor.balance);
    const roundedAmount = Math.round(amount * 100) / 100;

    if (roundedAmount > 0.01) {
      settlements.push({
        partyId,
        fromUserId: debtor.userId,
        fromUserName: debtor.displayName,
        toUserId: creditor.userId,
        toUserName: creditor.displayName,
        amount: roundedAmount,
      });
    }

    debtor.balance -= amount;
    creditor.balance -= amount;

    if (debtor.balance < 0.01) {
      dIdx++;
    }
    if (creditor.balance < 0.01) {
      cIdx++;
    }
  }

  return settlements;
}

