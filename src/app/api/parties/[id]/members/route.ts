import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db/database";
import { normalizePhoneNumber } from "@/lib/auth/otp";

interface Params {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { phoneNumber, displayName } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, message: "Phone number is required to invite a member" },
        { status: 400 }
      );
    }

    const normalized = normalizePhoneNumber(phoneNumber);
    const memberUser = db.createOrUpdatePhoneUser(normalized, displayName);

    const result = db.addPartyMember(params.id, memberUser, user as any);
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.error }, { status: 403 });
    }

    const party = db.getPartyById(params.id);

    return NextResponse.json({
      success: true,
      message: `${memberUser.displayName} has been added to the party!`,
      party,
    });
  } catch (error) {
    console.error("Error adding member:", error);
    return NextResponse.json({ success: false, message: "Failed to add member" }, { status: 500 });
  }
}

