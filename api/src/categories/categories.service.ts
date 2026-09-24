import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, ProductStatus } from "../generated/prisma/client.js";
import { isForeignKeyViolation, isUniqueViolation } from "../common/prisma-errors.js";
import { makeSlug, uniqueSlug } from "../common/slug.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { type ProductListQuery } from "../products/dto/products-query.dto.js";
import { ProductsService } from "../products/products.service.js";
import { CreateCategoryDto } from "./dto/create-category.dto.js";
import { UpdateCategoryDto } from "./dto/update-category.dto.js";

const published = { status: ProductStatus.PUBLISHED } as const;

/** Public callers only see published products. Admin counts include drafts. */
function buildInclude(scope: "public" | "admin") {
  const where = scope === "public" ? published : {};
  return {
    _count: { select: { products: { where } } },
    products: {
      where: published,
      orderBy: { createdAt: "desc" },
      take: 1,
      select: { images: { orderBy: { position: "asc" }, take: 1, select: { url: true, alt: true } } },
    },
  } satisfies Prisma.CategoryInclude;
}

type CategoryWithMeta = Prisma.CategoryGetPayload<{ include: ReturnType<typeof buildInclude> }>;

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly productsService: ProductsService,
  ) {}

  async findAll(scope: "public" | "admin" = "public") {
    const categories = await this.prisma.category.findMany({
      orderBy: { name: "asc" },
      include: buildInclude(scope),
    });
    return categories.map((category) => this.present(category));
  }

  async findOne(slugOrId: string, scope: "public" | "admin" = "public") {
    const category = await this.prisma.category.findFirst({
      where: { OR: [{ slug: slugOrId }, { id: slugOrId }] },
      include: buildInclude(scope),
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    return this.present(category);
  }

  /** Same shape and rules as the public product listing, filtered to one category. */
  async findProducts(slugOrId: string, query: ProductListQuery) {
    const category = await this.findOne(slugOrId);
    return this.productsService.findPublished({ ...query, categoryId: category.id });
  }

  async create(dto: CreateCategoryDto) {
    const slug = await this.resolveSlug(dto.slug, dto.name);
    try {
      const category = await this.prisma.category.create({
        data: { name: dto.name.trim(), slug, description: dto.description?.trim() || null },
        include: buildInclude("admin"),
      });
      return this.present(category);
    } catch (error) {
      if (isUniqueViolation(error)) throw new ConflictException("A category with this URL slug already exists");
      throw error;
    }
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const existing = await this.findById(id);
    const slug = dto.slug && dto.slug !== existing.slug ? await this.resolveSlug(dto.slug, dto.name ?? existing.name, id) : undefined;

    try {
      const category = await this.prisma.category.update({
        where: { id },
        data: {
          ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
          ...(dto.description !== undefined ? { description: dto.description?.trim() || null } : {}),
          ...(slug ? { slug } : {}),
        },
        include: buildInclude("admin"),
      });
      return this.present(category);
    } catch (error) {
      if (isUniqueViolation(error)) throw new ConflictException("A category with this URL slug already exists");
      throw error;
    }
  }

  async remove(id: string) {
    await this.findById(id);

    const productCount = await this.prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      throw new ConflictException(
        `This category still has ${productCount} ${productCount === 1 ? "product" : "products"}. Move or delete them first.`,
      );
    }

    try {
      await this.prisma.category.delete({ where: { id } });
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new ConflictException("This category still has products. Move or delete them first.");
      }
      throw error;
    }

    return { message: "Category deleted" };
  }

  private async findById(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException("Category not found");
    return category;
  }

  private async resolveSlug(explicit: string | undefined, name: string, excludeId?: string) {
    const isTaken = async (slug: string) =>
      (await this.prisma.category.count({ where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) } })) > 0;

    if (explicit) {
      if (await isTaken(explicit)) throw new ConflictException("That URL slug is already used by another category");
      return explicit;
    }
    return uniqueSlug(makeSlug(name, "category"), isTaken);
  }

  private present(category: CategoryWithMeta) {
    return {
      id: category.id,
      slug: category.slug,
      name: category.name,
      description: category.description,
      productCount: category._count.products,
      image: category.products[0]?.images[0]?.url ?? null,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
