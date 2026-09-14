import { eq } from "drizzle-orm";
import { dbClient as db } from "@db/client.js";
import { events } from "@db/schema.js";

export async function getOverview(userId: string) {
  const rows = await db.select().from(events).where(eq(events.userId, userId));
  const now = new Date();

  const overview = {
    overdue: [] as typeof rows,
    high: [] as typeof rows, // priority 1-2
    medium: [] as typeof rows, // priority 3
    low: [] as typeof rows, // priority 4-5
  };

  for (const row of rows) {
    if (row.status === "DONE") continue;

    if (row.startTime && row.startTime < now) {
      overview.overdue.push(row);
    } else if (row.priority <= 2) {
      overview.high.push(row);
    } else if (row.priority === 3) {
      overview.medium.push(row);
    } else {
      overview.low.push(row);
    }
  }

  return overview;
}