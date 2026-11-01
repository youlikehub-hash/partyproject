import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/database";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "GLOBAL_ADMIN") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Sandeep (GLOBAL_ADMIN) privileges required" },
        { status: 403 }
      );
    }

    const users = db.getUsers();

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Admin users list error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch users" }, { status: 500 });
  }
}
