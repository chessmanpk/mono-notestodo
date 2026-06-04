import type { Request, Response } from "express";
import { runMonthlyReset } from "../services/monthlyReset.service.js";

export async function monthlyReset(req: Request, res: Response) {
  const secret = req.headers["x-cron-secret"];
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ message: "Invalid cron secret" });
  }

  const result = await runMonthlyReset();
  res.json(result);
}
