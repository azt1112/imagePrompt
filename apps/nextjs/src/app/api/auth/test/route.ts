import { NextRequest, NextResponse } from "next/server";
import { env } from "@saasfly/auth/env.mjs";

export async function GET(request: NextRequest) {
  try {
    // 测试环境变量是否正确加载
    const envCheck = {
      NEXTAUTH_SECRET: !!env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: env.NEXTAUTH_URL,
      GOOGLE_CLIENT_ID: !!env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: !!env.GOOGLE_CLIENT_SECRET,
      NODE_ENV: process.env.NODE_ENV,
    };

    return NextResponse.json({
      status: "ok",
      message: "NextAuth test endpoint",
      env: envCheck,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("NextAuth test error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}