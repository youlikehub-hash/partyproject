import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mobileNumber, name, password } = body;

    if (!mobileNumber || !name || !password) {
      return NextResponse.json(
        { success: false, message: "Name, Mobile Number, and Password are all required." },
        { status: 400 }
      );
    }

    if (mobileNumber.trim().length < 8) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid mobile number." },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 4 characters long." },
        { status: 400 }
      );
    }

    const newUser = await registerUser({
      mobileNumber: mobileNumber.trim(),
      name: name.trim(),
      passwordPlain: password,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Registration submitted successfully! Your account is currently PENDING approval by Sandeep before you can log in.",
        user: {
          id: newUser.id,
          name: newUser.name,
          mobileNumber: newUser.mobileNumber,
          role: newUser.role,
          status: newUser.status,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to register user." },
      { status: 400 }
    );
  }
}

