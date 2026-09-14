import { Router } from "express";
import { getOverview } from "../service/overview.service.js";

export const overviewRouter = Router();

overviewRouter.get("/", async (req, res) => {
  const userId = (req as any).user?.id; // ⚠️ same auth note as chat.routes.ts
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const overview = await getOverview(userId);
  res.json(overview);
});