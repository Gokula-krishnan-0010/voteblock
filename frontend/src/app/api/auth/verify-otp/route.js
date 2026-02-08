import db from "@/app/lib/db";
import { compareOTP } from "@/app/lib/otp";
import { signToken } from "@/app/lib/jwt";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { userId, otp } = await req.json();

  if (!userId || !otp) {
    return NextResponse.json({ success: false, error: "Missing userId or OTP" }, { status: 400 });
  }

  const [rows] = await db.execute(
    `SELECT * FROM otp_verifications
     WHERE user_id = ? AND used = 0
     ORDER BY id DESC LIMIT 1`,
    [userId]
  );

  if (!rows.length) {
    return NextResponse.json({ success: false, error: "OTP not found" }, { status: 400 });
  }

  const record = rows[0];
  if (new Date() > new Date(record.expires_at)) {
    return NextResponse.json({ success: false, error: "OTP expired" }, { status: 400 });
  }

  const valid = await compareOTP(otp, record.otp_hash);
  if (!valid) {
    return NextResponse.json({ success: false, error: "Invalid OTP" }, { status: 401 });
  }

  await db.execute(
    "UPDATE otp_verifications SET used = TRUE WHERE id = ?",
    [record.id]
  );

  const token = signToken({ userId });

  return NextResponse.json(
    { success: true,
      message: "Authenticated" 
    },
    {
      status: 200,
      headers: {
        "Set-Cookie":
          `token=${token}; HttpOnly; ${process.env.NODE_ENV === "production" ? "Secure;" : ""} SameSite=Strict; Path=/`
      }
    }
  );
}
