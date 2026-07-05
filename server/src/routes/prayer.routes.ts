import { Router } from "express";
import { getPrayerLog, getPrayerLogs, upsertPrayerStatus } from "../controllers/prayer.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);
router.get("/", getPrayerLogs);
router.get("/:date", getPrayerLog);
router.patch("/:date", upsertPrayerStatus);

export default router;
