import "dotenv/config";
import jwt from "jsonwebtoken";

const JWT_SECRET_ENV = process.env.JWT_SECRET;
if (!JWT_SECRET_ENV) throw new Error("Missing JWT_SECRET in .env");
const JWT_SECRET: string = JWT_SECRET_ENV;

export function signToken(payload: { id: string; email: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as unknown as { id: string; email: string };
}