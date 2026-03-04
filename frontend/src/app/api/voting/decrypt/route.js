import { decrypt } from "@/server/paillierKeys";

export async function POST(req) {
  const { encryptedVote } = await req.json();

  if (!encryptedVote) {
    return Response.json({ error: "Missing encryptedVote" }, { status: 400 });
  }

  try {
    const result = decrypt(encryptedVote);
    return Response.json({ candidateId: result });
  } catch (err) {
    return Response.json({ error: "Decryption failed" }, { status: 500 });
  }
}