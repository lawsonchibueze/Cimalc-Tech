import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "../generated/prisma/client.js";

const databaseUrl = process.env.DATABASE_URL;
const betterAuthSecret = process.env.BETTER_AUTH_SECRET;
const betterAuthUrl = process.env.BETTER_AUTH_URL;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const uiUrl = process.env.UI_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to initialize Better Auth.");
}

if (!betterAuthSecret) {
  throw new Error("BETTER_AUTH_SECRET is required to initialize Better Auth.");
}

if (!betterAuthUrl) {
  throw new Error("BETTER_AUTH_URL is required to initialize Better Auth.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});
const isProduction = betterAuthUrl.startsWith("https://");

export const auth = betterAuth({
  baseURL: betterAuthUrl,
  secret: betterAuthSecret,
  trustedOrigins: uiUrl ? [uiUrl] : [],
  advanced: {
    defaultCookieAttributes: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    },
  },
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
  },
  ...(googleClientId && googleClientSecret
    ? {
        socialProviders: {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          },
        },
      }
    : {}),
});
