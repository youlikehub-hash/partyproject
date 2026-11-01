import { NextRequest, NextResponse } from "next/server";
import { adminLoginSchema } from "@/lib/validations/auth";
import { db } from "@/lib/db/database";
import { comparePassword } from "@/lib/auth/password";
import { signToken, COOKIE_NAME } from "@/lib/auth/jwt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = adminLoginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { username, password } = result.data;

    // Check against configured admin username (defaults to "Admin")
    const targetUsername = process.env.ADMIN_USERNAME || "Admin";
    if (username.trim().toLowerCase() !== targetUsername.toLowerCase()) {
      return NextResponse.json(
        { success: false, message: "Invalid administrator credentials" },
        { status: 401 }
      );
    }

    // Lookup user in DB
    const adminUser = db.getUserByUsername(targetUsername);
    if (!adminUser || !adminUser.passwordHash) {
      // Direct fallback if database reloaded
      const fallbackPassword = process.env.ADMIN_PASSWORD || "Admin@123";
      if (password !== fallbackPassword) {
        return NextResponse.json(
          { success: false, message: "Invalid administrator credentials" },
          { status: 401 }
        );
      }
    } else {
      const match = await comparePassword(password, adminUser.passwordHash);
      if (!match) {
        return NextResponse.json(
          { success: false, message: "Invalid administrator credentials" },
          { status: 401 }
        );
      }
    }

    const admin = adminUser || {
      id: "usr_admin_sandeep",
      username: "Admin",
      displayName: "Sandeep",
      role: "GLOBAL_ADMIN" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    };

    const token = await signToken({
      userId: admin.id,
      username: admin.username,
      displayName: admin.displayName,
      role: "GLOBAL_ADMIN",
    });

    db.logAudit({
      userId: admin.id,
      userName: admin.displayName,
      role: "GLOBAL_ADMIN",
      action: "ADMIN_LOGIN",
      resource: "AUTH",
      resourceId: admin.id,
      details: { username: admin.username, elevatedRole: "GLOBAL_ADMIN" },
    });

    const safeUser = {
      id: admin.id,
      username: admin.username,
      displayName: admin.displayName,
      role: admin.role,
      avatarUrl: admin.avatarUrl,
      isActive: admin.isActive,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };

    const response = NextResponse.json({
      success: true,
      message: "Elevated Global Administrator session initiated",
      user: safeUser,
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
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error during admin authentication" },
      { status: 500 }
    );
  }
}

