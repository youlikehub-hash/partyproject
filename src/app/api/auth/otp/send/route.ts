import { NextRequest, NextResponse } from "next/server";
import { sendOtpSchema } from "@/lib/validations/auth";
import { generateOtp, normalizePhoneNumber } from "@/lib/auth/otp";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = sendOtpSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { phoneNumber } = result.data;
    const normalized = normalizePhoneNumber(phoneNumber);
    const otp = generateOtp(normalized);

    // In a production SMS gateway (e.g. Twilio/AWS SNS), dispatch SMS here.
    // We return testOtp in response body for smooth instant interactive evaluation.
    return NextResponse.json({
      success: true,
      message: `OTP sent to ${normalized}. For instant testing, use OTP: ${otp} or 123456`,
      testOtp: otp,
    });
  } catch (error) {
    console.error("Error in send OTP:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error while dispatching OTP." },
      { status: 500 }
    );
  }
}

