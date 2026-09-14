import { eq } from "drizzle-orm";
import { dbClient, dbConn } from "@db/client.js";
import { events, usersTable } from "@db/schema.js";

async function insertData() {
  const [user] = await dbClient.select().from(usersTable).limit(1);
  if (!user) {
    console.error("No user found — register a user first");
    return dbConn.end();
  }

  await dbClient.insert(events).values({
    userId: user.id,
    title: "Finish reading",
    description: "Read the drizz...",
    startTime: new Date("2026-08-..."),
  });
  dbConn.end();
}

async function queryData() {
  const results = await dbClient.query.events.findMany();
  console.log(results);
  dbConn.end();
}

async function updateData() {
  const results = await dbClient.query.events.findMany();
  if (results.length === 0) dbConn.end();

  const id = results[0].id;
  await dbClient
    .update(events)
    .set({
      title: "Updated title",
    })
    .where(eq(events.id, id));
  dbConn.end();
}

async function deleteData() {
  const results = await dbClient.query.events.findMany();
  if (results.length === 0) dbConn.end();

  const id = results[0].id;
  await dbClient.delete(events).where(eq(events.id, id));
  dbConn.end();
}

// insertData();
queryData();
// updateData();
// deleteData();
