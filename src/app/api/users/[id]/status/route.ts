import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { updateUserStatus } from "@/lib/storage";
import { UserStatus } from "@/types/ledger";

export const dynamic = "force-dynamic";

interface Params {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const caller = await getCurrentUser();
    if (!caller || (caller.role !== "ADMIN" && caller.role !== "GLOBAL_ADMIN")) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Sandeep (Admin) privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { status } = body as { status: UserStatus };

    if (!["ACTIVE", "DEACTIVATED", "PENDING"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status provided. Must be ACTIVE, DEACTIVATED, or PENDING." },
        { status: 400 }
      );
    }

    const updatedUser = await updateUserStatus(params.id, status);

    const actionText =
      status === "ACTIVE"
        ? "approved and activated"
        : status === "DEACTIVATED"
        ? "deactivated"
        : "set to pending";

    return NextResponse.json({
      success: true,
      message: `User ${updatedUser.name} has been ${actionText}.`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        mobileNumber: updatedUser.mobileNumber,
        role: updatedUser.role,
        status: updatedUser.status,
      },
    });
  } catch (error: any) {
    console.error("Update user status error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update user status." },
      { status: 400 }
    );
  }
}

