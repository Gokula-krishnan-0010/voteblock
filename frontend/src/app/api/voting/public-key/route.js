import { getPublicKey } from "@/server/paillierKeys";

export const dynamic = "force-dynamic";   // never cache — key could rotate

export async function GET() {
  const { n, g } = getPublicKey();
  return Response.json({ n, g });
}