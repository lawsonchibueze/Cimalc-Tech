import { describe, expect, it, vi } from "vitest";
import { ConflictException } from "@nestjs/common";
import { ProductsService } from "./products.service.js";
import type { CreateProductDto } from "./dto/create-product.dto.js";
import type { ProductListQuery } from "./dto/products-query.dto.js";

function setup() {
  const prisma = {
    product: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockImplementation(async ({ data }) => ({
        ...data,
        id: "p1",
        image: null,
        categoryId: "c1",
        category: { id: "c1", slug: "phones", name: "Phones" },
        images: data.images.create,
        variants: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
    category: { findFirst: vi.fn().mockResolvedValue({ id: "c1", slug: "phones", name: "Phones" }) },
  };
  const uploads = { deleteObjects: vi.fn() };
  const service = new ProductsService(prisma as never, uploads as never);
  return { service, prisma, uploads };
}

const query: ProductListQuery = { page: 1, limit: 20, sort: "createdAt_desc" };
const image = { url: "https://cdn/a.png" };

describe("ProductsService", () => {
  it("only lists published products publicly", async () => {
    const { service, prisma } = setup();
    await service.findPublished(query);
    const where = JSON.stringify(prisma.product.findMany.mock.calls[0][0].where);
    expect(where).toContain('"status":"PUBLISHED"');
  });

  it("does not return drafts by slug", async () => {
    const { service, prisma } = setup();
    await expect(service.findPublishedBySlug("secret")).rejects.toThrow("Product not found");
    expect(prisma.product.findFirst.mock.calls[0][0].where).toMatchObject({ slug: "secret", status: "PUBLISHED" });
  });

  it("excludes the current product from related results", async () => {
    const { service, prisma } = setup();
    prisma.product.findFirst.mockResolvedValueOnce({ id: "p9", categoryId: "c1" });
    await service.findRelated("phone", query);
    const where = JSON.stringify(prisma.product.findMany.mock.calls[0][0].where);
    expect(where).toContain('"id":{"not":"p9"}');
  });

  it("makes the primary image first and reindexes positions", async () => {
    const { service, prisma } = setup();
    const dto = {
      name: "Nimbus 14",
      categoryId: "phones",
      images: [
        { url: "https://cdn/a.png", key: "products/a.png", position: 0 },
        { url: "https://cdn/b.png", key: "products/b.png", position: 1, isPrimary: true },
      ],
    } as CreateProductDto;
    await service.create(dto);
    const created = prisma.product.create.mock.calls[0][0].data;
    const summary = created.images.create.map((item: { key: string; isPrimary: boolean; position: number }) => [item.key, item.isPrimary, item.position]);
    expect(summary).toEqual([
      ["products/b.png", true, 0],
      ["products/a.png", false, 1],
    ]);
    expect(created.status).toBe("DRAFT");
  });

  it("adds a suffix instead of failing when a generated slug is taken", async () => {
    const { service, prisma } = setup();
    prisma.product.count.mockResolvedValueOnce(1).mockResolvedValue(0);
    await service.create({ name: "Nimbus 14", categoryId: "phones", images: [image] } as CreateProductDto);
    expect(prisma.product.create.mock.calls[0][0].data.slug).toBe("nimbus-14-2");
  });

  it("rejects an explicit slug that is already used", async () => {
    const { service, prisma } = setup();
    prisma.product.count.mockResolvedValue(1);
    const dto = { name: "Nimbus", slug: "nimbus", categoryId: "phones", images: [image] } as CreateProductDto;
    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
  });

  it("explains why a product used by quotes cannot be deleted", async () => {
    const { service, prisma, uploads } = setup();
    prisma.product.findUnique.mockResolvedValue({ id: "p1", images: [{ key: "products/a.png" }] });
    prisma.product.delete.mockRejectedValue({ code: "P2003" });
    await expect(service.remove("p1")).rejects.toThrow(/quote requests/);
    expect(uploads.deleteObjects).not.toHaveBeenCalled();
  });
});
