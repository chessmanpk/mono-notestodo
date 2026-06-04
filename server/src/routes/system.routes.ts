import { Router } from "express";
import { monthlyReset } from "../controllers/system.controller.js";

const router = Router();

router.post("/monthly-reset", monthlyReset);

export default router;
