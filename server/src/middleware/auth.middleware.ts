import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { requireEnv } from "../utils/env.js";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const cookieToken = req.cookies?.token;
    const bearerToken = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null;
    const token = cookieToken || bearerToken;

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(token, requireEnv("JWT_SECRET")) as { id: string; email: string };
    const user = await User.findById(decoded.id).select("_id email");

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = { id: String(user._id), email: user.email };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired session" });
  }
}
