import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

loadEnvConfig(process.cwd());

const isMigrate = process.argv.includes("migrate");
const databaseUrl = process.env.DATABASE_URL;

if (isMigrate && !databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Add a personal Neon connection string to .env.local before migrating.",
  );
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl ?? "postgresql://unused:unused@localhost/unused",
  },
});
