import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/database";
import { createExpenseSchema } from "@/lib/validations/expense";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const partyId = searchParams.get("partyId");

    const isAdmin = user.role === "GLOBAL_ADMIN";

    let expenses;
    if (partyId) {
      expenses = db.getExpensesByParty(partyId);
    } else {
      expenses = db.getAllExpenses(user.id, isAdmin);
    }

    return NextResponse.json({
      success: true,
      expenses,
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = createExpenseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.errors[0].message, errors: result.error.format() },
        { status: 400 }
      );
    }

    const { expense, error } = db.createExpense(result.data, user as any);
    if (error || !expense) {
      return NextResponse.json({ success: false, message: error || "Failed to add expense" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Expense recorded and split successfully!",
      expense,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json({ success: false, message: "Failed to create expense" }, { status: 500 });
  }
}
