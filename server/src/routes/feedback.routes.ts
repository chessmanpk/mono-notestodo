import { Router } from "express";
import {
  createFeedback,
  getMyFeedback,
} from "../controllers/feedback.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/mine", getMyFeedback);
router.post("/", createFeedback);

export default router;