import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getParties } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const caller = await getCurrentUser();
    if (!caller || (caller.role !== "ADMIN" && caller.role !== "GLOBAL_ADMIN")) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Sandeep (Admin) privileges required." },
        { status: 403 }
      );
    }

    const pendingParties = await getParties("PENDING");
    return NextResponse.json({
      success: true,
      parties: pendingParties,
    });
  } catch (error) {
    console.error("Error fetching pending parties:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch pending parties." },
      { status: 500 }
    );
  }
}

