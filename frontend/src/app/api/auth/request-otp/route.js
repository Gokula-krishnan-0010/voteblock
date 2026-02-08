import db from "@/app/lib/db";
import { generateOTP, hashOTP } from "@/app/lib/otp";
import { sendOTP } from "@/app/lib/email";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { userId, email } = await req.json();

  const otp = generateOTP();
  const otpHash = await hashOTP(otp);

  await db.execute(
    `INSERT INTO otp_verifications (user_id, otp_hash, expires_at)
     VALUES (?, ?, NOW() + INTERVAL 5 MINUTE)`,
    [userId, otpHash]
  );

  await sendOTP(email, otp);

  return NextResponse.json({ message: "OTP sent" });
}
