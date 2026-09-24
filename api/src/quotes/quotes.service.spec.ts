import { describe, expect, it, vi } from "vitest";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { QuotesService } from "./quotes.service.js";

const quoteRow = (overrides: Record<string, unknown> = {}) => ({
  id: "q1",
  reference: "Q-260924-ABC123",
  status: "PENDING",
  customerName: "Ada",
  email: "ada@example.com",
  phone: null,
  message: "Need two",
  userId: "u1",
  createdAt: new Date(),
  updatedAt: new Date(),
  cancelledAt: null,
  items: [{ id: "i1", quantity: 2, product: { id: "p1", slug: "phone", name: "Phone", images: [{ url: "https://cdn/a.png" }] } }],
  messages: [
    { id: "m1", body: "Hi", createdAt: new Date(), fromStaff: false },
    { id: "m2", body: "Sure", createdAt: new Date(), fromStaff: true },
  ],
  ...overrides,
});

function setup() {
  const prisma = {
    product: { findFirst: vi.fn().mockResolvedValue({ id: "p1", name: "Phone" }) },
    quote: {
      create: vi.fn().mockImplementation(async () => quoteRow()),
      findFirst: vi.fn().mockResolvedValue(quoteRow()),
      findMany: vi.fn().mockResolvedValue([]),
      update: vi.fn().mockImplementation(async () => quoteRow({ status: "CANCELLED" })),
    },
    quoteMessage: { create: vi.fn() },
  };
  const mail = { send: vi.fn(), staffAddress: undefined };
  return { service: new QuotesService(prisma as never, mail as never), prisma, mail };
}

const viewer = { id: "u1", email: "Ada@Example.com", emailVerified: true };

describe("QuotesService", () => {
  it("only accepts quotes for published products", async () => {
    const { service, prisma } = setup();
    prisma.product.findFirst.mockResolvedValue(null);
    await expect(service.create({ customerName: "Ada", email: "a@b.co", productId: "p1", quantity: 1 }, undefined)).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.product.findFirst.mock.calls[0][0].where).toMatchObject({ status: "PUBLISHED" });
  });

  it("exposes the original message, message senders and a slim product", async () => {
    const { service } = setup();
    const quote = await service.create({ customerName: "Ada", email: "a@b.co", productId: "p1", quantity: 2 }, viewer);
    expect(quote.message).toBe("Need two");
    expect(quote.messages.map((message) => message.sender)).toEqual(["CUSTOMER", "STAFF"]);
    expect(quote.productLines[0].product).toEqual({ id: "p1", slug: "phone", name: "Phone", image: "https://cdn/a.png" });
  });

  it("matches guest quotes by email only for verified accounts", async () => {
    const { service, prisma } = setup();
    await service.findMine(viewer);
    expect(JSON.stringify(prisma.quote.findMany.mock.calls[0][0].where)).toContain('"userId":null');

    await service.findMine({ ...viewer, emailVerified: false });
    expect(JSON.stringify(prisma.quote.findMany.mock.calls[1][0].where)).not.toContain('"userId":null');
  });

  it("refuses to cancel a quote that was already answered", async () => {
    const { service, prisma } = setup();
    prisma.quote.findFirst.mockResolvedValue(quoteRow({ status: "QUOTED" }));
    await expect(service.cancel(viewer, "q1")).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.quote.update).not.toHaveBeenCalled();
  });

  it("cancels a pending quote and records the time", async () => {
    const { service, prisma } = setup();
    await service.cancel(viewer, "q1");
    expect(prisma.quote.update.mock.calls[0][0].data).toMatchObject({ status: "CANCELLED", cancelledAt: expect.any(Date) });
  });

  it("does not allow messages on a closed quote", async () => {
    const { service, prisma } = setup();
    prisma.quote.findFirst.mockResolvedValue(quoteRow({ status: "CANCELLED" }));
    await expect(service.addMessage(viewer, "q1", { body: "hello" })).rejects.toBeInstanceOf(ConflictException);
  });
});
