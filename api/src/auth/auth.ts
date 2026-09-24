import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "../generated/prisma/client.js";
import { getAllowedOrigins } from "../common/origins.js";
import { sendMail } from "../mail/mailer.js";

const databaseUrl = process.env.DATABASE_URL;
const betterAuthSecret = process.env.BETTER_AUTH_SECRET;
const betterAuthUrl = process.env.BETTER_AUTH_URL;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

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
// When the site and the API sit on subdomains of one domain, for example
// shop.example.com and api.example.com, set COOKIE_DOMAIN=example.com. The
// session cookie then becomes first party, which browsers that block third
// party cookies require and which lets the frontend read it.
const cookieDomain = process.env.COOKIE_DOMAIN?.trim() || undefined;

export const auth = betterAuth({
  baseURL: betterAuthUrl,
  secret: betterAuthSecret,
  trustedOrigins: getAllowedOrigins(),
  advanced: {
    defaultCookieAttributes: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction && !cookieDomain ? "none" : "lax",
    },
    ...(cookieDomain ? { crossSubDomainCookies: { enabled: true, domain: cookieDomain } } : {}),
  },
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      // Not awaited so the response time does not reveal whether the account exists.
      void sendMail({
        to: user.email,
        subject: "Reset your Cimalc Tech password",
        text: `Hello ${user.name},\n\nUse this link to choose a new password. It expires in one hour.\n\n${url}\n\nIf you did not ask for this, you can ignore this email.`,
      }).catch(() => undefined);
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        input: false,
        defaultValue: "USER",
      },
    },
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
