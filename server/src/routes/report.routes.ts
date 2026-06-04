import { Router } from "express";
import {
  exportReportJson,
  exportReportMarkdown,
  exportReportPdf,
  generateCurrentReport,
  getReport,
  getReports,
} from "../controllers/report.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);
router.get("/", getReports);
router.post("/generate-current", generateCurrentReport);
router.get("/:id", getReport);
router.get("/:id/export/json", exportReportJson);
router.get("/:id/export/markdown", exportReportMarkdown);
router.get("/:id/export/pdf", exportReportPdf);

export default router;
