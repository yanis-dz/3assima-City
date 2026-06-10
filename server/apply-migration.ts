import "dotenv/config";
import { pool } from "./db";
import fs from "fs";
import path from "path";

async function applyMigration() {
    console.log("Starting manual migration...");
    try {
        const sqlPath = path.join(process.cwd(), "migrations", "0000_cold_red_ghost.sql");
        const sqlContent = fs.readFileSync(sqlPath, "utf-8");

        // Split by statement-breakpoint
        const statements = sqlContent.split("--> statement-breakpoint");

        const tables = [
            "api_keys", "balances", "faqs", "news", "oauth_accounts",
            "pending_orders", "products", "rules", "settings", "staff",
            "ticket_messages", "tickets", "transactions", "users"
        ];

        console.log("Dropping existing tables to ensure a clean state...");
        for (const table of tables) {
            await pool.query(`DROP TABLE IF EXISTS \`${table}\``);
        }

        console.log("Executing migration statements...");
        for (let statement of statements) {
            statement = statement.trim();
            if (statement) {
                // console.log(`Executing: ${statement.substring(0, 50)}...`);
                await pool.query(statement);
            }
        }

        console.log("Migration applied successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

applyMigration();
