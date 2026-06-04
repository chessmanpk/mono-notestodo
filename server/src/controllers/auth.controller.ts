import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Task from "../models/Task.js";
import Note from "../models/Note.js";
import Project from "../models/Project.js";
import MonthlyReport from "../models/MonthlyReport.js";
import ArchivedMonth from "../models/ArchivedMonth.js";
import { createResetToken, hashResetToken, signAuthToken } from "../utils/tokens.js";

function cookieOptions(rememberMe = false) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
    maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
  };
}

function safeUser(user: any) {
  return user.toJSON ? user.toJSON() : user;
}

export async function register(req: Request, res: Response) {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "Full name, email, and password are required" });
  }

  if (String(password).length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters" });
  }

  const existing = await User.findOne({ email: String(email).toLowerCase() });
  if (existing) return res.status(409).json({ message: "Email is already registered" });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ fullName, email, passwordHash });
  const token = signAuthToken({ id: String(user._id), email: user.email }, true);

  res.cookie("token", token, cookieOptions(true));
  res.status(201).json({ user: safeUser(user) });
}

export async function login(req: Request, res: Response) {
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user) return res.status(401).json({ message: "Invalid email or password" });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ message: "Invalid email or password" });

  const token = signAuthToken({ id: String(user._id), email: user.email }, Boolean(rememberMe));
  res.cookie("token", token, cookieOptions(Boolean(rememberMe)));
  res.json({ user: safeUser(user) });
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.json({ message: "Logged out" });
}

export async function me(req: Request, res: Response) {
  const user = await User.findById(req.user!.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user: safeUser(user) });
}

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const user = await User.findOne({ email: String(email).toLowerCase() });

  // Always return success to avoid leaking registered emails.
  if (!user) {
    return res.json({ message: "If this email exists, a reset link has been created" });
  }

  const { rawToken, hashedToken } = createResetToken();
  user.resetPasswordTokenHash = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  res.json({
    message: "Password reset token created. In production, email this token as a reset link.",
    devResetToken: process.env.NODE_ENV === "production" ? undefined : rawToken,
  });
}

export async function resetPassword(req: Request, res: Response) {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ message: "Token and new password are required" });
  if (String(password).length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });

  const tokenHash = hashResetToken(token);
  const user = await User.findOne({
    resetPasswordTokenHash: tokenHash,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) return res.status(400).json({ message: "Invalid or expired reset token" });

  user.passwordHash = await bcrypt.hash(password, 12);
  user.resetPasswordTokenHash = null;
  user.resetPasswordExpires = null;
  await user.save();

  res.json({ message: "Password reset successful" });
}

export async function updateProfile(req: Request, res: Response) {
  const { fullName, theme, notificationPreferences } = req.body;
  const update: Record<string, unknown> = {};

  if (fullName) update.fullName = String(fullName).trim();
  if (["system", "light", "dark"].includes(theme)) update.theme = theme;
  if (notificationPreferences && typeof notificationPreferences === "object") {
    update.notificationPreferences = notificationPreferences;
  }

  const user = await User.findByIdAndUpdate(req.user!.id, update, { new: true });
  res.json({ user: safeUser(user) });
}

export async function exportMyData(req: Request, res: Response) {
  const userId = req.user!.id;
  const [user, tasks, notes, projects, reports, archives] = await Promise.all([
    User.findById(userId),
    Task.find({ userId }).sort({ createdAt: -1 }),
    Note.find({ userId }).sort({ createdAt: -1 }),
    Project.find({ userId }).sort({ createdAt: -1 }),
    MonthlyReport.find({ userId }).sort({ year: -1, month: -1 }),
    ArchivedMonth.find({ userId }).sort({ year: -1, month: -1 }),
  ]);

  res.json({ exportedAt: new Date(), user: safeUser(user), tasks, notes, projects, reports, archives });
}

export async function deleteAccount(req: Request, res: Response) {
  const userId = req.user!.id;
  await Promise.all([
    Task.deleteMany({ userId }),
    Note.deleteMany({ userId }),
    Project.deleteMany({ userId }),
    MonthlyReport.deleteMany({ userId }),
    ArchivedMonth.deleteMany({ userId }),
    User.findByIdAndDelete(userId),
  ]);
  res.clearCookie("token");
  res.json({ message: "Account and all related data deleted" });
}
