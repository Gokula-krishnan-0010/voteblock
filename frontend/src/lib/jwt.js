import jwt from "jsonwebtoken";

export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "15m",
    algorithm: 'HS256',
    issuer: 'vote-block',
  });
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET, {
    algorithms: ['HS256'],
    issuer: 'vote-block',
  });
}
