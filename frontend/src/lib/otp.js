import crypto from "crypto";
import bcrypt from "bcrypt";

export function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

export async function hashOTP(otp) {
  const OTP_SALT_ROUNDS = Number(process.env.BCRYPT_OTP_SALT_ROUNDS) || 10;
  return await bcrypt.hash(otp, OTP_SALT_ROUNDS);
}

export async function compareOTP(otp, hash) {
  return await bcrypt.compare(otp, hash);
}
