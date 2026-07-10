import { Router } from "express";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAllAnnouncementsAdmin,
  getAnnouncements,
  updateAnnouncement,
} from "../controllers/announcement.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);
router.get("/", getAnnouncements);
router.get("/admin", requireRole("admin"), getAllAnnouncementsAdmin);
router.post("/", requireRole("admin"), createAnnouncement);
router.patch("/:id", requireRole("admin"), updateAnnouncement);
router.delete("/:id", requireRole("admin"), deleteAnnouncement);

export default router;
