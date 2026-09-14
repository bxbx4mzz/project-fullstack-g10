import { Router } from "express";
import { chat } from "../service/Ai.service.js";
import { getHistory } from "../service/chat.service.js";

export const chatRouter = Router();

// replace `(req as any).user?.id` with however your teammate's auth middleware
// attaches the logged-in user (e.g. req.user.id from a JWT/session middleware)
chatRouter.get("/", async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const history = await getHistory(userId);
  res.json(history);
});

chatRouter.post("/", async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { message } = req.body as { message?: string };
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "message is required" });
  }

  try {
    const reply = await chat(userId, message);
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process chat message" });
  }
});