import bcrypt from 'bcrypt';

const PASSWORD_SALT_ROUNDS = Number(process.env.BCRYPT_PASSWORD_SALT_ROUNDS) || 12;

export async function hashPassword(password) {
  return await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
}

export async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}
