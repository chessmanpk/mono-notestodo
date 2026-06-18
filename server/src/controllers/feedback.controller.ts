import type { Request, Response } from "express";
import Feedback, {
  FEEDBACK_STATUSES,
  FEEDBACK_TYPES,
  type FeedbackStatus,
  type FeedbackType,
} from "../models/Feedback.js";

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function normalizeFeedbackType(value: unknown): FeedbackType {
  const requestedType = cleanText(value, 30);
  return FEEDBACK_TYPES.includes(requestedType as FeedbackType) ? (requestedType as FeedbackType) : "general";
}

function isFeedbackStatus(value: unknown): value is FeedbackStatus {
  return FEEDBACK_STATUSES.includes(value as FeedbackStatus);
}

function getOptionalFilter<T extends readonly string[]>(value: unknown, allowed: T): T[number] | undefined {
  if (typeof value !== "string" || value === "all") return undefined;
  return allowed.includes(value as T[number]) ? (value as T[number]) : undefined;
}

export async function createFeedback(req: Request, res: Response) {
  const title = cleanText(req.body.title, 140);
  const message = cleanText(req.body.message, 2500);
  const type = normalizeFeedbackType(req.body.type);

  if (!title) {
    return res.status(400).json({ message: "Feedback title is required" });
  }

  if (!message) {
    return res.status(400).json({ message: "Feedback message is required" });
  }

  if (message.length < 10) {
    return res.status(400).json({
      message: "Feedback message should be at least 10 characters",
    });
  }

  const feedback = await Feedback.create({
    userId: req.user!.id,
    userEmail: req.user!.email,
    type,
    title,
    message,
    status: "open",
  });

  res.status(201).json({ feedback });
}

export async function getMyFeedback(req: Request, res: Response) {
  const feedback = await Feedback.find({ userId: req.user!.id })
    .sort({ createdAt: -1 })
    .lean();

  res.json({ feedback });
}

export async function getAdminFeedback(req: Request, res: Response) {
  const status = getOptionalFilter(req.query.status, FEEDBACK_STATUSES);
  const type = getOptionalFilter(req.query.type, FEEDBACK_TYPES);
  const query: Record<string, unknown> = {};

  if (status) query.status = status;
  if (type) query.type = type;

  const feedback = await Feedback.find(query)
    .sort({ createdAt: -1 })
    .populate("reviewedBy", "fullName email role")
    .lean();

  res.json({ feedback });
}

export async function updateAdminFeedback(req: Request, res: Response) {
  const { status } = req.body;
  const adminNote = cleanText(req.body.adminNote, 1000);

  if (!isFeedbackStatus(status)) {
    return res.status(400).json({ message: "A valid feedback status is required" });
  }

  const feedback = await Feedback.findByIdAndUpdate(
    req.params.id,
    {
      status,
      adminNote,
      reviewedBy: req.user!.id,
      reviewedAt: new Date(),
    },
    { new: true, runValidators: true }
  ).populate("reviewedBy", "fullName email role");

  if (!feedback) {
    return res.status(404).json({ message: "Feedback not found" });
  }

  res.json({ feedback });
}
