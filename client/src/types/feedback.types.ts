export type FeedbackType = "bug" | "feature" | "general";

export type FeedbackStatus = "open" | "reviewed" | "closed";

export type FeedbackItem = {
  _id: string;
  userId: string;
  userEmail: string;
  type: FeedbackType;
  title: string;
  message: string;
  status: FeedbackStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateFeedbackInput = {
  type: FeedbackType;
  title: string;
  message: string;
};