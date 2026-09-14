import type { NextFunction, Request, Response } from "express";
// adjust this path to wherever auth.ts actually sits relative to
// src/middleware/ (e.g. "../auth.js" if auth.ts is directly under src/)
import { verifyToken } from "../auth.js";

export interface AuthedRequest extends Request {
  user?: { id: string; email: string };
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}