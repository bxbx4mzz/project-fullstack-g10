import { asc, eq } from "drizzle-orm";
import { dbClient as db } from "@db/client.js";
import { chatMessages } from "@db/schema.js";

export async function getHistory(userId: string, limit = 30) {
  return db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.userId, userId))
    .orderBy(asc(chatMessages.createdAt))
    .limit(limit);
}

export async function saveMessage(
  userId: string,
  role: "user" | "assistant" | "tool",
  content: string,
  toolCalls?: unknown
) {
  const [row] = await db
    .insert(chatMessages)
    .values({ userId, role, content, toolCalls })
    .returning();
  return row;
}