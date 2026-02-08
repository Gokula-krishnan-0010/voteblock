import db from "@/app/lib/db";
import bcrypt from "bcrypt";

export async function POST(req) {
  const { email, password } = await req.json();

  const [rows] = await db.execute(
    "SELECT id, password_hash FROM users WHERE email = ?",
    [email]
  );

  if (!rows.length) {
    return Response.json({ success: false, error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, rows[0].password_hash);
  if (!valid) {
    return Response.json({ success: false, error: "Invalid credentials" }, { status: 401 });
  }

  return Response.json({ success: true, userId: rows[0].id });
}
