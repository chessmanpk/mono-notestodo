import { Router } from "express";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
  updateAnnouncement,
} from "../controllers/announcement.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", getAnnouncements);
router.post("/", requireRole("admin", "manager"), createAnnouncement);
router.patch("/:id", requireRole("admin", "manager"), updateAnnouncement);
router.delete("/:id", requireRole("admin", "manager"), deleteAnnouncement);

export default router;
