import "dotenv/config";
import express from "express";
import cors from "cors";
import { eq } from "drizzle-orm";
import { dbClient } from "@db/client.js";
import { todoTable, usersTable } from "@db/schema.js";
import Debug from "debug";
import type { ErrorRequestHandler } from "express";
import helmet from "helmet";
import morgan from "morgan";
import bcrypt from "bcrypt";

import { signToken } from "./auth.js";
import { requireAuth } from "./middleware/requireAuth.js";
import { chatRouter } from "./routes/Chat.routes.js";
import { overviewRouter } from "./routes/Overview.routes.js";
import { eventsRouter } from "./routes/events.routes.js";

const debug = Debug("pf-backend");

const app = express();

app.use(morgan("dev", { immediate: false }));
app.use(helmet());
app.use(cors());
app.use(express.json());

// ---------- Todo (unchanged demo routes) ----------
app.get("/todo", async (req, res, next) => {
  try {
    const results = await dbClient.query.todoTable.findMany();
    res.json(results);
  } catch (err) {
    next(err);
  }
});

app.put("/todo", async (req, res, next) => {
  try {
    const todoText = req.body.todoText ?? "";
    if (!todoText) throw new Error("Empty todoText");
    const result = await dbClient
      .insert(todoTable)
      .values({ todoText })
      .returning({ id: todoTable.id, todoText: todoTable.todoText });
    res.json({ msg: "Insert successfully", data: result[0] });
  } catch (err) {
    next(err);
  }
});

app.patch("/todo", async (req, res, next) => {
  try {
    const id = req.body.id ?? "";
    const todoText = req.body.todoText ?? "";
    if (!todoText || !id) throw new Error("Empty todoText or id");

    const results = await dbClient.query.todoTable.findMany({
      where: eq(todoTable.id, id),
    });
    if (results.length === 0) throw new Error("Invalid id");

    const result = await dbClient
      .update(todoTable)
      .set({ todoText })
      .where(eq(todoTable.id, id))
      .returning({ id: todoTable.id, todoText: todoTable.todoText });
    res.json({ msg: "Update successfully", data: result });
  } catch (err) {
    next(err);
  }
});

app.delete("/todo", async (req, res, next) => {
  try {
    const id = req.body.id ?? "";
    if (!id) throw new Error("Empty id");

    const results = await dbClient.query.todoTable.findMany({
      where: eq(todoTable.id, id),
    });
    if (results.length === 0) throw new Error("Invalid id");

    await dbClient.delete(todoTable).where(eq(todoTable.id, id));
    res.json({ msg: "Delete successfully", data: { id } });
  } catch (err) {
    next(err);
  }
});

app.post("/todo/all", async (req, res, next) => {
  try {
    await dbClient.delete(todoTable);
    res.json({ msg: "Delete all rows successfully", data: {} });
  } catch (err) {
    next(err);
  }
});

// ---------- Auth ----------
const GMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

app.post("/auth/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      throw new Error("Missing name, email, or password");
    }
    if (!GMAIL_REGEX.test(email)) {
      throw new Error("Email must be a valid @gmail.com address");
    }

    const existing = await dbClient.query.usersTable.findMany({
      where: (u, { eq }) => eq(u.email, email),
    });
    if (existing.length > 0) throw new Error("Email already registered");

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await dbClient
      .insert(usersTable)
      .values({ name, email, password: hashedPassword })
      .returning({ id: usersTable.id, name: usersTable.name, email: usersTable.email });

    const user = result[0];
    const token = signToken({ id: user.id, email: user.email });

    res.json({ msg: "Register successfully", data: user, token });
  } catch (err) {
    next(err);
  }
});

app.post("/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new Error("Missing email or password");

    const users = await dbClient.query.usersTable.findMany({
      where: (u, { eq }) => eq(u.email, email),
    });
    if (users.length === 0) throw new Error("Invalid email or password");

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid email or password");

    const token = signToken({ id: user.id, email: user.email });

    res.json({ msg: "Login successfully", token });
  } catch (err) {
    next(err);
  }
});

app.use("/chat", requireAuth, chatRouter);
app.use("/overview", requireAuth, overviewRouter);
app.use("/events", requireAuth, eventsRouter);

// ---------- Error handling ----------
const jsonErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  debug(err.message);
  const errorResponse = {
    message: err.message || "Internal Server Error",
    type: err.name || "Error",
    stack: err.stack,
  };
  res.status(500).send(errorResponse);
};
app.use(jsonErrorHandler);

// ---------- Start server ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  debug(`Listening on port ${PORT}: http://localhost:${PORT}`);
});