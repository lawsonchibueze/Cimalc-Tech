import { afterEach, describe, expect, it } from "vitest";
import { getAllowedOrigins } from "./origins.js";
import { pageMeta } from "./pagination.js";
import { isForeignKeyViolation, isUniqueViolation } from "./prisma-errors.js";
import { makeSlug, uniqueSlug } from "./slug.js";

describe("makeSlug", () => {
  it("lowercases and hyphenates", () => {
    expect(makeSlug("  Nimbus 14 Laptop! ")).toBe("nimbus-14-laptop");
  });

  it("strips accents", () => {
    expect(makeSlug("Café Ünit")).toBe("cafe-unit");
  });

  it("falls back when nothing usable is left", () => {
    expect(makeSlug("!!!", "product")).toBe("product");
  });
});

describe("uniqueSlug", () => {
  it("returns the base when it is free", async () => {
    expect(await uniqueSlug("phone", async () => false)).toBe("phone");
  });

  it("appends the first free suffix", async () => {
    const taken = new Set(["phone", "phone-2"]);
    expect(await uniqueSlug("phone", async (slug) => taken.has(slug))).toBe("phone-3");
  });
});

describe("pageMeta", () => {
  it("rounds the page count up and never returns zero pages", () => {
    expect(pageMeta(1, 20, 41).totalPages).toBe(3);
    expect(pageMeta(1, 20, 0).totalPages).toBe(1);
  });
});

describe("prisma error helpers", () => {
  it("recognises unique and foreign key violations by code", () => {
    expect(isUniqueViolation({ code: "P2002" })).toBe(true);
    expect(isForeignKeyViolation({ code: "P2003" })).toBe(true);
    expect(isUniqueViolation({ code: "P2003" })).toBe(false);
  });
});

describe("getAllowedOrigins", () => {
  const original = process.env.UI_URL;
  afterEach(() => {
    if (original === undefined) delete process.env.UI_URL;
    else process.env.UI_URL = original;
  });

  it("splits a comma separated list and trims trailing slashes", () => {
    process.env.UI_URL = "https://a.example.com/, https://www.a.example.com ,";
    expect(getAllowedOrigins()).toEqual(["https://a.example.com", "https://www.a.example.com"]);
  });

  it("returns an empty list when unset", () => {
    delete process.env.UI_URL;
    expect(getAllowedOrigins()).toEqual([]);
  });
});
