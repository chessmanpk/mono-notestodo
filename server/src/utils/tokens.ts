import crypto from "crypto";
import jwt from "jsonwebtoken";
import type { UserRole } from "../models/User.js";
import { requireEnv } from "./env.js";

export function signAuthToken(payload: { id: string; email: string; role?: UserRole }, rememberMe = false) {
  return jwt.sign(payload, requireEnv("JWT_SECRET"), {
    expiresIn: rememberMe ? "30d" : "1d",
  });
}

export function createResetToken() {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, hashedToken };
}

export function hashResetToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
