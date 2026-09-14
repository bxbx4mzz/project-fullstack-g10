import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  boolean,
  text,
  integer,
  jsonb,
  serial,
  date,
  time,
} from "drizzle-orm/pg-core";

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" }) //import user from login
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  priority: integer("priority").default(3).notNull(), // 1 (highest) – 5 (lowest)
  status: varchar("status", { length: 20 }).default("TODO").notNull(), // TODO | IN_PROGRESS | DONE
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", precision: 3 }).$onUpdate(
    () => new Date()
  ),
});

export const todoTable = pgTable("todo", {
  id: uuid("id").primaryKey().defaultRandom(),
  todoText: varchar("todo_text", { length: 255 }).notNull(),
  
  isDone: boolean("is_done").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", precision: 3 }).$onUpdate(
    () => new Date()
  ),
});

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 150 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => usersTable.id, { onDelete: "cascade" }) //import user from login
    .notNull(),
  role: text("role").notNull(), // 'user' | 'assistant' | 'tool'
  content: text("content").notNull(),
  toolCalls: jsonb("tool_calls"), // raw tool_use / tool_result payload, handy for debugging
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
 
// export const eventsTable = pgTable("events", {
//   id: serial("id").primaryKey(),
//   title: text("title").notNull(),
//   description: text("description"),
//   date: date("date").notNull(),
//   time: time("time"), // nullable: the calendar form only requires title + date
// });
 
