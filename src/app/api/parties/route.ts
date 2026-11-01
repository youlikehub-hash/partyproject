import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getParties, createParty, saveUploadedBill } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("status");

    // Return parties based on status filter, or all parties if ALL / unspecified
    let parties;
    if (!filter || filter === "ALL") {
      parties = await getParties();
    } else if (filter === "PENDING" || filter === "REJECTED" || filter === "APPROVED") {
      parties = await getParties(filter);
    } else {
      parties = await getParties();
    }

    return NextResponse.json({
      success: true,
      parties,
    });
  } catch (error) {
    console.error("Error fetching parties:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch parties." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Please log in to submit a party." },
        { status: 401 }
      );
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, message: "Only approved active users can submit parties." },
        { status: 403 }
      );
    }

    const contentType = req.headers.get("content-type") || "";

    let date = "";
    let hotelName = "";
    let amountSpent = 0;
    let remarks = "";
    let billImageUrl = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      date = (formData.get("date") as string) || "";
      hotelName = (formData.get("hotelName") as string) || "";
      amountSpent = parseFloat((formData.get("amountSpent") as string) || "0");
      remarks = (formData.get("remarks") as string) || "";

      const file = formData.get("billFile") as File | null;
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        billImageUrl = await saveUploadedBill(buffer, file.name);
      } else {
        billImageUrl = (formData.get("billImageUrl") as string) || "";
      }
    } else {
      const body = await req.json();
      date = body.date;
      hotelName = body.hotelName;
      amountSpent = Number(body.amountSpent);
      remarks = body.remarks;
      billImageUrl = body.billImageUrl || "";
    }

    if (!date || !hotelName || !amountSpent) {
      return NextResponse.json(
        { success: false, message: "Date, Hotel/Venue Name, and Amount Spent are required." },
        { status: 400 }
      );
    }

    if (amountSpent <= 0) {
      return NextResponse.json(
        { success: false, message: "Amount spent must be greater than zero." },
        { status: 400 }
      );
    }

    // Default fallback placeholder bill if none uploaded
    if (!billImageUrl) {
      billImageUrl = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80";
    }

    const newParty = await createParty({
      hostId: user.id,
      hostName: user.name,
      date: new Date(date).toISOString(),
      hotelName,
      amountSpent,
      remarks: remarks || "Office Celebration",
      billImageUrl,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Party expense submitted successfully! It is now PENDING review and approval by Sandeep.",
        party: newParty,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create party error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to submit party expense." },
      { status: 400 }
    );
  }
}
