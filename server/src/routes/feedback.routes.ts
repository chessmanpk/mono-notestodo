import { Router } from "express";
import {
  createFeedback,
  getAdminFeedback,
  getMyFeedback,
  updateAdminFeedback,
} from "../controllers/feedback.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/admin", requireRole("admin"), getAdminFeedback);
router.patch("/admin/:id", requireRole("admin"), updateAdminFeedback);
router.get("/mine", getMyFeedback);
router.post("/", createFeedback);

export default router;
