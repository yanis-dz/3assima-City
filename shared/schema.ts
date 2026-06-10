import { mysqlTable, serial, varchar, text, timestamp, boolean, int, mysqlEnum, json } from "drizzle-orm/mysql-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  role: mysqlEnum("role", ["owner", "admin", "moderator", "user"]).notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userSchema = createSelectSchema(users);
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

export const news = mysqlTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  author: varchar("author", { length: 255 }).notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const newsSchema = createSelectSchema(news);
export const insertNewsSchema = createInsertSchema(news).omit({ id: true, createdAt: true });
export type News = z.infer<typeof newsSchema>;
export type InsertNews = z.infer<typeof insertNewsSchema>;

export const staff = mysqlTable("staff", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull(),
  role: varchar("role", { length: 255 }).notNull(),
  avatarUrl: text("avatar_url"),
  order: int("order").notNull(),
});

export const staffSchema = createSelectSchema(staff);
export const insertStaffSchema = createInsertSchema(staff).omit({ id: true, order: true });
export type Staff = z.infer<typeof staffSchema>;
export type InsertStaff = z.infer<typeof insertStaffSchema>;

export const rules = mysqlTable("rules", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 255 }).notNull(),
});

export const ruleSchema = createSelectSchema(rules);
export const insertRuleSchema = createInsertSchema(rules).omit({ id: true });
export type Rule = z.infer<typeof ruleSchema>;
export type InsertRule = z.infer<typeof insertRuleSchema>;

export const products = mysqlTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  price: int("price").notNull(),
  imageUrl: text("image_url"),
  category: varchar("category", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["vehicle", "item", "rank", "money", "other"]).notNull().default("item"),
  currency: mysqlEnum("currency", ["game_money", "real_money"]).notNull().default("game_money"),
  discount: int("discount").notNull().default(0), // Discount percentage 0-100
  inStock: boolean("in_stock").notNull().default(true),
});

export const productSchema = createSelectSchema(products);
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export type Product = z.infer<typeof productSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export const settings = mysqlTable("settings", {
  id: serial("id").primaryKey(),
  serverName: varchar("server_name", { length: 255 }).notNull().default("RIXEL ROLEPLAY"),
  serverNameAr: varchar("server_name_ar", { length: 255 }).notNull().default("ريكسل للحياة الواقعية"),
  serverIp: varchar("server_ip", { length: 255 }).notNull().default("109.176.229.142:22003"),
  discordLink: varchar("discord_link", { length: 255 }).notNull().default(""),
  forumLink: varchar("forum_link", { length: 255 }).notNull().default(""),
  heroTitle: varchar("hero_title", { length: 255 }).notNull().default("RIXEL ROLEPLAY"),
  heroSubtitle: varchar("hero_subtitle", { length: 1000 }).notNull().default("انضم إلى سيرفرنا واستمتع بأفضل تجربة لعب حياة واقعية"),
  footerText: varchar("footer_text", { length: 1000 }).notNull().default("أفضل تجربة لعب حياة واقعية في MTA"),
});

export const settingsSchema = createSelectSchema(settings).omit({ id: true });
export type Settings = z.infer<typeof settingsSchema>;

export const tickets = mysqlTable("tickets", {
  id: serial("id").primaryKey(),
  userId: int("user_id").notNull(),
  username: varchar("username", { length: 255 }).notNull(),
  department: mysqlEnum("department", ["technical", "billing", "general", "report"]).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["open", "in_progress", "closed"]).notNull().default("open"),
  adminResponse: text("admin_response"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const ticketSchema = createSelectSchema(tickets);
export const insertTicketSchema = createInsertSchema(tickets).omit({ id: true, createdAt: true, updatedAt: true, adminResponse: true, status: true });
export type Ticket = z.infer<typeof ticketSchema>;
export type InsertTicket = z.infer<typeof insertTicketSchema>;

export const faqs = mysqlTable("faqs", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: varchar("category", { length: 255 }).notNull(),
  order: int("order").notNull(),
});

export const faqSchema = createSelectSchema(faqs);
export const insertFaqSchema = createInsertSchema(faqs).omit({ id: true, order: true });
export type Faq = z.infer<typeof faqSchema>;
export type InsertFaq = z.infer<typeof insertFaqSchema>;

export const ticketMessages = mysqlTable("ticket_messages", {
  id: serial("id").primaryKey(),
  ticketId: int("ticket_id").notNull(),
  userId: int("user_id").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ticketMessageSchema = createSelectSchema(ticketMessages);
export const insertTicketMessageSchema = createInsertSchema(ticketMessages).omit({ id: true, createdAt: true });
export type TicketMessage = z.infer<typeof ticketMessageSchema>;
export type InsertTicketMessage = z.infer<typeof insertTicketMessageSchema>;

export const balances = mysqlTable("balances", {
  userId: int("user_id").primaryKey(),
  usd: int("usd").notNull().default(0),
  sar: int("sar").notNull().default(0),
  points: int("points").notNull().default(0),
});

export const balanceSchema = createSelectSchema(balances);
export type Balance = z.infer<typeof balanceSchema>;

export const transactions = mysqlTable("transactions", {
  id: serial("id").primaryKey(),
  userId: int("user_id").notNull(),
  type: mysqlEnum("type", ["deposit", "withdrawal", "purchase", "refund", "bonus", "transfer"]).notNull(),
  amount: int("amount").notNull(),
  currency: mysqlEnum("currency", ["usd", "sar", "points"]).notNull(),
  description: text("description").notNull(),
  reference: varchar("reference", { length: 255 }),
  status: mysqlEnum("status", ["pending", "completed", "failed", "cancelled"]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactionSchema = createSelectSchema(transactions);
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });
export type Transaction = z.infer<typeof transactionSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export const oauthAccounts = mysqlTable("oauth_accounts", {
  id: serial("id").primaryKey(),
  userId: int("user_id").notNull(),
  provider: mysqlEnum("provider", ["discord", "google"]).notNull(),
  providerId: varchar("provider_id", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  username: varchar("username", { length: 255 }),
  avatarUrl: text("avatar_url"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const oauthAccountSchema = createSelectSchema(oauthAccounts);
export type OAuthAccount = z.infer<typeof oauthAccountSchema>;

export const apiKeys = mysqlTable("api_keys", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  permissions: json("permissions").$type<string[]>().notNull(),
  createdBy: int("created_by").notNull(),
  lastUsed: timestamp("last_used"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const apiKeySchema = createSelectSchema(apiKeys);
export type ApiKey = z.infer<typeof apiKeySchema>;

export const pendingOrders = mysqlTable("pending_orders", {
  orderId: varchar("order_id", { length: 255 }).primaryKey(),
  userId: int("user_id").notNull(),
  amount: varchar("amount", { length: 255 }).notNull(),
  currency: varchar("currency", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["pending", "completed", "cancelled"]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pendingOrderSchema = createSelectSchema(pendingOrders);
export type PendingOrder = z.infer<typeof pendingOrderSchema>;

// Game Database Tables (Read-Only)
export const gameAccounts = mysqlTable("accounts", {
  id: int("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull(),
  discordId: varchar("discordID", { length: 255 }),
  email: varchar("email", { length: 255 }),
  registerDate: timestamp("registerdate"),
  lastLogin: timestamp("lastlogin"),
  ip: varchar("ip", { length: 255 }),
  admin: int("admin").notNull().default(0),
  supporter: int("supporter").notNull().default(0),
  vct: int("vct").notNull().default(0),
  mapper: int("mapper").notNull().default(0),
  scripter: int("scripter").notNull().default(0),
  credits: int("credits").notNull().default(0),
  mtaserial: varchar("mtaserial", { length: 255 }),
  activated: int("activated").notNull().default(0),
});

export const gameAccountSchema = createSelectSchema(gameAccounts);
export type GameAccount = z.infer<typeof gameAccountSchema>;

export const gameCharacters = mysqlTable("characters", {
  id: int("id").primaryKey(),
  charactername: varchar("charactername", { length: 255 }).notNull(),
  account: int("account").notNull(),
  x: text("x"),
  y: text("y"),
  z: text("z"),
  rotation: text("rotation"),
  interior_id: int("interior_id").notNull().default(0),
  dimension_id: int("dimension_id").notNull().default(0),
  skin: int("skin").notNull().default(0),
  health: text("health"),
  armor: text("armor"),
  money: int("money").notNull().default(0),
  bankmoney: int("bankmoney").notNull().default(0),
  gender: int("gender").notNull().default(0),
  age: int("age").notNull().default(18),
  cuffed: int("cuffed").notNull().default(0),
  duty: int("duty").notNull().default(0),
  pdjail: int("pdjail").notNull().default(0),
  cked: int("cked").notNull().default(0),
  factionId: int("faction_id").notNull().default(-1),
  factionRank: int("faction_rank").notNull().default(1),
  hoursPlayed: int("hoursplayed").notNull().default(0),
  lastLogin: timestamp("lastlogin"),
  hunger: int("hunger").notNull().default(100),
  thirst: int("thirst").notNull().default(100),
  sleep: int("sleep").notNull().default(100),
  stress: int("stress").notNull().default(0),
  car_license: int("car_license").notNull().default(0),
  bike_license: int("bike_license").notNull().default(0),
  pilot_license: int("pilot_license").notNull().default(0),
  gun_license: int("gun_license").notNull().default(0),
});

export const gameCharacterSchema = createSelectSchema(gameCharacters);
export type GameCharacter = z.infer<typeof gameCharacterSchema>;

export const gameFactions = mysqlTable("factions", {
  id: int("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  bankbalance: int("bankbalance").notNull().default(0),
  type: int("type").notNull().default(0),
  ranks: json("ranks").$type<string[]>(), // We'll store ranks as a list for easier frontend handling if possible, or just individual columns
  // Since the user listed rank_1 to rank_20 and wage_1 to wage_20:
  rank1: varchar("rank_1", { length: 255 }),
  rank2: varchar("rank_2", { length: 255 }),
  rank3: varchar("rank_3", { length: 255 }),
  rank4: varchar("rank_4", { length: 255 }),
  rank5: varchar("rank_5", { length: 255 }),
  rank6: varchar("rank_6", { length: 255 }),
  rank7: varchar("rank_7", { length: 255 }),
  rank8: varchar("rank_8", { length: 255 }),
  rank9: varchar("rank_9", { length: 255 }),
  rank10: varchar("rank_10", { length: 255 }),
  rank11: varchar("rank_11", { length: 255 }),
  rank12: varchar("rank_12", { length: 255 }),
  rank13: varchar("rank_13", { length: 255 }),
  rank14: varchar("rank_14", { length: 255 }),
  rank15: varchar("rank_15", { length: 255 }),
  rank16: varchar("rank_16", { length: 255 }),
  rank17: varchar("rank_17", { length: 255 }),
  rank18: varchar("rank_18", { length: 255 }),
  rank19: varchar("rank_19", { length: 255 }),
  rank20: varchar("rank_20", { length: 255 }),
  motd: text("motd"),
  phone: varchar("phone", { length: 255 }),
  note: text("note"),
  fnote: text("fnote"),
});

export const gameFactionSchema = createSelectSchema(gameFactions);
export type GameFaction = z.infer<typeof gameFactionSchema>;
