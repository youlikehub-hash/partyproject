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

    const { partyId, hostUserId, status, title, venue } = await req.json();

    if (!partyId) {
      return NextResponse.json({ success: false, message: "Party ID is required" }, { status: 400 });
    }

    const { party, error } = db.updateParty(
      partyId,
      { hostUserId, status, title, venue },
      user as any
    );

    if (error || !party) {
      return NextResponse.json({ success: false, message: error || "Override failed" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Administrative override applied for party '${party.title}'`,
      party,
    });
  } catch (error) {
    console.error("Admin override error:", error);
    return NextResponse.json({ success: false, message: "Failed to apply override" }, { status: 500 });
  }
}

