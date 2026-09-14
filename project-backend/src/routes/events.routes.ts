import { Router } from "express";
import * as eventService from "../service/event.service.js";

export const eventsRouter = Router();

eventsRouter.get("/", async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  try {
    const events = await eventService.listEvents(userId, req.query as any);
    res.json(events);
  } catch (err) {
    console.error("GET /events ERROR:", err); // ← จะเห็น error จริงตรงนี้
    res.status(500).json({ error: (err as Error).message });
  }
});

eventsRouter.post("/", async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const { title, description, start_time, end_time, priority, status } = req.body ?? {};
  if (!title || !start_time) {
    return res.status(400).json({ error: "title and start_time are required" });
  }

  try {
    const event = await eventService.createEvent(userId, {
      title,
      description,
      start_time,
      end_time,
      priority,
      status: status ?? "TODO",
    });
    res.status(201).json(event);
  } catch (err) {
    console.error("POST /events ERROR:", err); // ← จะเห็น error จริงตรงนี้
    res.status(500).json({ error: (err as Error).message });
  }
});