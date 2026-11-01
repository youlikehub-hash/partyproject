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

    const logs = db.getAuditLogs(150);

    return NextResponse.json({
      success: true,
      logs,
    });
  } catch (error) {
    console.error("Admin audit logs error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch audit logs" }, { status: 500 });
  }
}
