import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = mysql.createPool({
host: "82.22.174.127",
user: "u18_xqZxhQ0CL3",
password: "Uwt2!woPg.Qhln@w@i^5oX2I",
database: "s18_user_yanis", 
  charset: "utf8mb4",
  supportBigNumbers: true,
  bigNumberStrings: false,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const db = drizzle(pool, { schema, mode: "default" });
