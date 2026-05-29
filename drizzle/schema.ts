import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, decimal } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/** Leads captured from the lead wall */
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 32 }).notNull(),
  address: text("address"),
  lat: decimal("lat", { precision: 10, scale: 7 }),
  lng: decimal("lng", { precision: 10, scale: 7 }),
  opportunityScore: int("opportunityScore"),
  recommendation: varchar("recommendation", { length: 16 }),
  serviceModel: varchar("serviceModel", { length: 64 }),
  cuisineConcept: varchar("cuisineConcept", { length: 256 }),
  priceTier: varchar("priceTier", { length: 8 }),
  conceptFitScore: int("conceptFitScore"),
  conceptRecommendation: varchar("conceptRecommendation", { length: 16 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/** Cached analysis reports for addresses */
export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId"),
  address: text("address").notNull(),
  lat: decimal("lat", { precision: 10, scale: 7 }).notNull(),
  lng: decimal("lng", { precision: 10, scale: 7 }).notNull(),
  competitors: json("competitors"),
  marketAnalysis: json("marketAnalysis"),
  concepts: json("concepts"),
  equipmentList: json("equipmentList"),
  opportunityScore: int("opportunityScore"),
  recommendation: varchar("recommendation", { length: 16 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;
