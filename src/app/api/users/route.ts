import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getAllUsers } from "@/lib/storage";

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

    const users = await getAllUsers();
    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch users." }, { status: 500 });
  }
}

