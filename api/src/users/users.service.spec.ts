import { describe, expect, it, vi } from "vitest";
import { BadRequestException } from "@nestjs/common";
import { UsersService } from "./users.service.js";

function setup(role: "USER" | "ADMIN" = "ADMIN") {
  const prisma = {
    user: {
      findUnique: vi.fn().mockResolvedValue({ id: "u1", role }),
      update: vi.fn().mockResolvedValue({ id: "u1" }),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
  };
  return { service: new UsersService(prisma as never), prisma };
}

describe("UsersService", () => {
  it("blocks administrators from changing their own role", async () => {
    const { service, prisma } = setup("ADMIN");
    await expect(service.update("u1", "u1", { role: "USER" })).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("lets an administrator change someone else", async () => {
    const { service, prisma } = setup("USER");
    await service.update("admin1", "u1", { role: "ADMIN" });
    expect(prisma.user.update).toHaveBeenCalledOnce();
  });

  it("promotes only existing accounts listed in ADMIN_EMAILS", async () => {
    const { service, prisma } = setup();
    process.env.ADMIN_EMAILS = " Boss@Example.com ,";
    await service.onApplicationBootstrap();
    delete process.env.ADMIN_EMAILS;
    expect(prisma.user.updateMany.mock.calls[0][0].where.email).toEqual({ in: ["boss@example.com"] });
  });
});
