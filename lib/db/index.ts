import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://unused:unused@localhost/unused";

export const db = drizzle({ client: neon(databaseUrl), schema });
