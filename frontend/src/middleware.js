import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { db } from "@/lib/db";

export async function middleware(req) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.redirect(new URL("/", req.url));

  const { userId } = verifyToken(token);

  const [rows] = await db.execute(
    "SELECT role FROM users WHERE id = ?",
    [userId]
  );

  const role = rows[0].role;

  if (req.nextUrl.pathname.startsWith("/dashboard/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard/voter", req.url));
  }
}
