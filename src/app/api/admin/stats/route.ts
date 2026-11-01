import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/database";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "GLOBAL_ADMIN")) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Sandeep (GLOBAL_ADMIN) privileges required" },
        { status: 403 }
      );
    }

    const metrics = db.getSystemMetrics();

    return NextResponse.json({
      success: true,
      metrics,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ success: false, message: "Failed to load metrics" }, { status: 500 });
  }
}
