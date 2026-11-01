import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getPartyById, updateParty, deleteParty } from "@/lib/storage";

export const dynamic = "force-dynamic";

interface Params {
  params: { id: string };
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const party = await getPartyById(params.id);
    if (!party) {
      return NextResponse.json({ success: false, message: "Party not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      party,
    });
  } catch (error) {
    console.error("Error fetching party:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch party" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const party = await getPartyById(params.id);
    if (!party) {
      return NextResponse.json({ success: false, message: "Party not found" }, { status: 404 });
    }

    const isHost = party.hostId === user.id;
    const isAdmin = user.role === "ADMIN" || user.role === "GLOBAL_ADMIN";
    if (!isHost && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Permission denied: Only the host or Admin can update this party" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updated = await updateParty(params.id, body);

    return NextResponse.json({
      success: true,
      message: "Party updated successfully",
      party: updated,
    });
  } catch (error) {
    console.error("Error updating party:", error);
    return NextResponse.json({ success: false, message: "Failed to update party" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const party = await getPartyById(params.id);
    if (!party) {
      return NextResponse.json({ success: false, message: "Party not found" }, { status: 404 });
    }

    const isHost = party.hostId === user.id;
    const isAdmin = user.role === "ADMIN" || user.role === "GLOBAL_ADMIN";
    if (!isHost && !isAdmin) {
      return NextResponse.json(
        { success: false, message: "Permission denied: Only the host or Admin can delete this party" },
        { status: 403 }
      );
    }

    const success = await deleteParty(params.id);
    if (!success) {
      return NextResponse.json({ success: false, message: "Failed to delete party" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Party record deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting party:", error);
    return NextResponse.json({ success: false, message: "Failed to delete party" }, { status: 500 });
  }
}
