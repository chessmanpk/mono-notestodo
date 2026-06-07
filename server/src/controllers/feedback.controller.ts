import type { Request, Response } from "express";
import Feedback from "../models/Feedback.js";

const allowedFeedbackTypes = ["bug", "feature", "general"] as const;

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export async function createFeedback(req: Request, res: Response) {
  const title = cleanText(req.body.title, 140);
  const message = cleanText(req.body.message, 2500);

  const requestedType = cleanText(req.body.type, 30);
  const type = allowedFeedbackTypes.includes(
    requestedType as (typeof allowedFeedbackTypes)[number]
  )
    ? requestedType
    : "general";

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