import { api } from "./api";
import type {
  AdminFeedbackFilters,
  CreateFeedbackInput,
  FeedbackItem,
  UpdateAdminFeedbackInput,
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

  async getAdmin(filters: AdminFeedbackFilters = {}) {
    const response = await api.get<{ feedback: FeedbackItem[] }>(
      "/feedback/admin",
      { params: filters }
    );

    return response.data.feedback;
  },

  async updateAdmin(feedbackId: string, input: UpdateAdminFeedbackInput) {
    const response = await api.patch<{ feedback: FeedbackItem }>(
      `/feedback/admin/${feedbackId}`,
      input
    );

    return response.data.feedback;
  },
};
