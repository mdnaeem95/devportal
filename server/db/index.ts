import dotenv from "dotenv";
import path from "path";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql, { schema });

export type Database = typeof db;
