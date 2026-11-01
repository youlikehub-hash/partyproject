import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/database";

interface Params {
  params: { id: string };
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { success, error } = db.deleteExpense(params.id, user as any);
    if (!success) {
      return NextResponse.json({ success: false, message: error || "Failed to delete expense" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      message: "Expense removed successfully",
    });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json({ success: false, message: "Failed to delete expense" }, { status: 500 });
  }
}

