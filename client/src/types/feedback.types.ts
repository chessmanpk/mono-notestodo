import type { UserRole } from ".";

export type FeedbackType = "bug" | "feature" | "general";

export type FeedbackStatus = "open" | "reviewed" | "closed";

export type FeedbackReviewer = {
  _id: string;
  fullName: string;
  email: string;
  role: UserRole;
};

export type FeedbackItem = {
  _id: string;
  userId: string;
  userEmail: string;
  type: FeedbackType;
  title: string;
  message: string;
  status: FeedbackStatus;
  adminNote: string;
  reviewedBy: string | FeedbackReviewer | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateFeedbackInput = {
  type: FeedbackType;
  title: string;
  message: string;
};

export type AdminFeedbackFilters = {
  status?: FeedbackStatus | "all";
  type?: FeedbackType | "all";
};

export type UpdateAdminFeedbackInput = {
  status: FeedbackStatus;
  adminNote?: string;
};
