import { and, eq, gte, lte } from "drizzle-orm";
import { dbClient as db } from "@db/client.js";
import { events } from "@db/schema.js";

export type ListEventsFilter = {
  from?: string;
  to?: string;
  status?: string;
  priority?: number;
};

export async function listEvents(userId: string, filter: ListEventsFilter = {}) {
  const conditions = [eq(events.userId, userId)];
  if (filter.from) conditions.push(gte(events.startTime, new Date(filter.from)));
  if (filter.to) conditions.push(lte(events.startTime, new Date(filter.to)));
  if (filter.status) conditions.push(eq(events.status, filter.status));
  if (filter.priority) conditions.push(eq(events.priority, filter.priority));

  return db
    .select()
    .from(events)
    .where(and(...conditions));
}

export async function createEvent(
  userId: string,
  input: {
    title: string;
    description?: string;
    start_time: string;
    end_time?: string;
    priority?: number;
    status?: string;
  }
) {
  const [row] = await db
    .insert(events)
    .values({
      userId,
      title: input.title,
      description: input.description ?? null,
      startTime: new Date(input.start_time),
      endTime: input.end_time ? new Date(input.end_time) : null,
      priority: input.priority ?? 3,
      status: input.status ?? "TODO",
    })
    .returning();
  return row;
}

export async function updateEvent(
  userId: string,
  id: string,
  fields: Partial<{
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    priority: number;
    status: string;
  }>
) {
  const patch: Record<string, unknown> = {};
  if (fields.title !== undefined) patch.title = fields.title;
  if (fields.description !== undefined) patch.description = fields.description;
  if (fields.start_time !== undefined) patch.startTime = new Date(fields.start_time);
  if (fields.end_time !== undefined) patch.endTime = new Date(fields.end_time);
  if (fields.priority !== undefined) patch.priority = fields.priority;
  if (fields.status !== undefined) patch.status = fields.status;

  const [row] = await db
    .update(events)
    .set(patch)
    .where(and(eq(events.id, id), eq(events.userId, userId)))
    .returning();
  return row;
}

export async function deleteEvent(userId: string, id: string) {
  const [row] = await db
    .delete(events)
    .where(and(eq(events.id, id), eq(events.userId, userId)))
    .returning();
  return row;
}