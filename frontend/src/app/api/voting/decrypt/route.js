import { decrypt } from "@/server/paillierKeys";

export async function POST(req) {
  const { ciphertext } = await req.json();

  const result = await decrypt(ciphertext);

  return Response.json({ result });
}