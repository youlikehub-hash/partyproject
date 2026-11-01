import { NextRequest, NextResponse } from "next/server";
import { verifyOtpSchema } from "@/lib/validations/auth";
import { verifyOtp, normalizePhoneNumber } from "@/lib/auth/otp";
import { db } from "@/lib/db/database";
import { signToken, COOKIE_NAME } from "@/lib/auth/jwt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = verifyOtpSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { phoneNumber, otp, displayName } = result.data;
    const normalized = normalizePhoneNumber(phoneNumber);

    const verification = verifyOtp(normalized, otp);
    if (!verification.valid) {
      return NextResponse.json(
        { success: false, message: verification.reason || "Invalid OTP code" },
        { status: 401 }
      );
    }

    // User lookup or creation
    const user = db.createOrUpdatePhoneUser(normalized, displayName);

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: "This account has been deactivated. Contact Admin (Sandeep)." },
        { status: 403 }
      );
    }

    const token = await signToken({
      userId: user.id,
      phoneNumber: user.phoneNumber,
      displayName: user.displayName,
      role: user.role,
    });

    db.logAudit({
      userId: user.id,
      userName: user.displayName,
      role: user.role,
      action: "USER_LOGIN",
      resource: "AUTH",
      resourceId: user.id,
      details: { method: "Phone OTP", phoneNumber: normalized },
    });

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful",
      user,
      sessionToken: token,
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error in verify OTP:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error while verifying OTP" },
      { status: 500 }
    );
  }
}

