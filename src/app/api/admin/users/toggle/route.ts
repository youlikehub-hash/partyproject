import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/database";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "GLOBAL_ADMIN")) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Sandeep (GLOBAL_ADMIN) privileges required" },
        { status: 403 }
      );
    }

    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID required" }, { status: 400 });
    }

    const updatedUser = db.toggleUserStatus(userId, user.id);
    if (!updatedUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `User ${updatedUser.displayName} status changed to ${updatedUser.isActive ? "Active" : "Deactivated"}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Toggle user error:", error);
    return NextResponse.json({ success: false, message: "Failed to update user status" }, { status: 500 });
  }
}

