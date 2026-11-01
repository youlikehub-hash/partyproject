import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { moderateParty } from "@/lib/storage";

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
    const { status, adminRemarks } = body as {
      status: "APPROVED" | "REJECTED";
      adminRemarks?: string;
    };

    if (!status || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status. Must be APPROVED or REJECTED." },
        { status: 400 }
      );
    }

    const updatedParty = await moderateParty(
      params.id,
      status,
      adminRemarks || "",
      caller.name
    );

    return NextResponse.json({
      success: true,
      message: `Party expense has been ${status.toLowerCase()} by Sandeep.`,
      party: updatedParty,
    });
  } catch (error: any) {
    console.error("Moderate party error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to moderate party." },
      { status: 400 }
    );
  }
}

