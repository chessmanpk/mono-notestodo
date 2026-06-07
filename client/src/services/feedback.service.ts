import { api } from "./api";
import type {
  CreateFeedbackInput,
  FeedbackItem,
} from "../types/feedback.types";

export const feedbackService = {
  async getMine() {
    const response = await api.get<{ feedback: FeedbackItem[] }>(
      "/feedback/mine"
    );

    return response.data.feedback;
  },

  async create(input: CreateFeedbackInput) {
    const response = await api.post<{ feedback: FeedbackItem }>(
      "/feedback",
      input
    );

    return response.data.feedback;
  },
};