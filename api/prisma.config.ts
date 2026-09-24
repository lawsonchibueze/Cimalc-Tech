import "dotenv/config";
import { defineConfig } from "prisma/config";

// The Prisma CLI runs migrations, and providers with connection poolers, such as
// Neon, need a direct connection for that. Set DIRECT_URL to the non-pooled
// address. The running API keeps using DATABASE_URL.
const url = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!url) {
  throw new Error("Set DATABASE_URL, and DIRECT_URL if your database uses a connection pooler.");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url,
  },
});
