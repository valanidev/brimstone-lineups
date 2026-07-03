import {
  pgTable,
  uuid,
  text,
  varchar,
  real,
  timestamp,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const lineups = pgTable("lineups", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  map: varchar("map", { length: 100 }).notNull(),
  site: varchar("site", { length: 10 }).notNull(),
  difficulty: varchar("difficulty", { length: 50 }).notNull(),
  tags: text("tags").array().notNull(),
  from: text("from").notNull(),
  to: text("to").notNull(),
  travelTime: real("travel_time").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
