import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/database";
import { settleDebtSchema } from "@/lib/validations/expense";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = settleDebtSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { partyId, fromUserId, toUserId, amount } = result.data;

    const { expense, error } = db.recordSettlement(partyId, fromUserId, toUserId, amount, user as any);
    if (error || !expense) {
      return NextResponse.json({ success: false, message: error || "Settlement failed" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Settlement recorded and balance updated!",
      expense,
    });
  } catch (error) {
    console.error("Error in settle debt:", error);
    return NextResponse.json({ success: false, message: "Failed to record settlement" }, { status: 500 });
  }
}

