import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User, { USER_ROLES, type UserRole } from "../models/User.js";
import { requireEnv } from "../utils/env.js";

function normalizeRole(role: unknown): UserRole {
  return USER_ROLES.includes(role as UserRole) ? (role as UserRole) : "user";
}

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
    const user = await User.findById(decoded.id).select("_id email role");

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    const role = normalizeRole(user.role);
    if (user.role !== role) {
      user.role = role;
      await user.save();
    }

    req.user = { id: String(user._id), email: user.email, role };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired session" });
  }
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission to access this resource" });
    }

    next();
  };
}
