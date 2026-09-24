import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, ProductStatus } from "../generated/prisma/client.js";
import { pageArgs, pageMeta } from "../common/pagination.js";
import { isForeignKeyViolation, isUniqueViolation } from "../common/prisma-errors.js";
import { makeSlug, uniqueSlug } from "../common/slug.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { UploadsService } from "../uploads/uploads.service.js";
import { AdminProductsQueryDto, type ProductListQuery, type ProductSort } from "./dto/products-query.dto.js";
import { CreateProductDto, MAX_PRODUCT_IMAGES } from "./dto/create-product.dto.js";
import { UpdateProductDto } from "./dto/update-product.dto.js";
import type { ProductImageDto } from "./dto/product-image.dto.js";

const include = {
  category: true,
  images: { orderBy: { position: "asc" } },
  variants: { orderBy: { name: "asc" } },
} as const;

type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof include }>;

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploads: UploadsService,
  ) {}

  /** Public catalogue. Only published products are ever returned. */
  async findPublished(query: ProductListQuery, extraWhere: Prisma.ProductWhereInput = {}) {
    return this.list(query, { AND: [{ status: ProductStatus.PUBLISHED }, extraWhere] });
  }

  async findPublishedBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, status: ProductStatus.PUBLISHED },
      include,
    });

    if (!product) throw new NotFoundException("Product not found");
    return this.present(product);
  }

  findNewArrivals(query: ProductListQuery) {
    return this.findPublished({ ...query, sort: "createdAt_desc" });
  }

  findFeatured(query: ProductListQuery) {
    return this.findPublished(query, { featured: true });
  }

  async findRelated(slug: string, query: ProductListQuery) {
    const product = await this.prisma.product.findFirst({
      where: { slug, status: ProductStatus.PUBLISHED },
      select: { id: true, categoryId: true },
    });
    if (!product) throw new NotFoundException("Product not found");
    return this.findPublished({ ...query, categoryId: undefined }, { categoryId: product.categoryId, id: { not: product.id } });
  }

  /** Admin catalogue. Includes drafts and can filter by status. */
  findAdmin(query: AdminProductsQueryDto) {
    return this.list(query, {
      AND: [
        query.status ? { status: query.status } : {},
        query.featured !== undefined ? { featured: query.featured } : {},
      ],
    });
  }

  async findAdminById(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id }, include });
    if (!product) throw new NotFoundException("Product not found");
    return this.present(product);
  }

  async create(dto: CreateProductDto) {
    const category = await this.ensureCategory(dto.categoryId);
    const images = this.normalizeImages(dto.images);
    const slug = await this.resolveSlug(dto.slug, dto.name);

    try {
      const product = await this.prisma.product.create({
        data: {
          name: dto.name.trim(),
          slug,
          description: dto.description?.trim() || null,
          stock: dto.stock ?? 0,
          status: dto.status ?? ProductStatus.DRAFT,
          featured: dto.featured ?? false,
          categoryId: category.id,
          images: { create: images },
        },
        include,
      });
      return this.present(product);
    } catch (error) {
      if (isUniqueViolation(error)) throw new ConflictException("A product with this URL slug already exists");
      throw error;
    }
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.prisma.product.findUnique({ where: { id }, include: { images: true } });
    if (!existing) throw new NotFoundException("Product not found");

    const category = dto.categoryId ? await this.ensureCategory(dto.categoryId) : undefined;
    const images = dto.images ? this.normalizeImages(dto.images) : undefined;
    const slug = dto.slug && dto.slug !== existing.slug ? await this.resolveSlug(dto.slug, dto.name ?? existing.name, id) : undefined;

    try {
      const product = await this.prisma.$transaction(async (tx) => {
        if (images) await tx.productImage.deleteMany({ where: { productId: id } });
        return tx.product.update({
          where: { id },
          data: {
            ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
            ...(dto.description !== undefined ? { description: dto.description.trim() || null } : {}),
            ...(dto.stock !== undefined ? { stock: dto.stock } : {}),
            ...(dto.status !== undefined ? { status: dto.status } : {}),
            ...(dto.featured !== undefined ? { featured: dto.featured } : {}),
            ...(category ? { categoryId: category.id } : {}),
            ...(slug ? { slug } : {}),
            ...(images ? { images: { create: images } } : {}),
          },
          include,
        });
      });

      if (images) {
        const keptKeys = new Set(images.map((image) => image.key));
        await this.uploads.deleteObjects(existing.images.map((image) => image.key).filter((key) => !keptKeys.has(key)));
      }
      return this.present(product);
    } catch (error) {
      if (isUniqueViolation(error)) throw new ConflictException("A product with this URL slug already exists");
      throw error;
    }
  }

  async remove(id: string) {
    const existing = await this.prisma.product.findUnique({ where: { id }, include: { images: true } });
    if (!existing) throw new NotFoundException("Product not found");

    try {
      await this.prisma.product.delete({ where: { id } });
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new ConflictException("This product is part of quote requests and cannot be deleted. Set it to draft to hide it instead.");
      }
      throw error;
    }

    await this.uploads.deleteObjects(existing.images.map((image) => image.key));
    return { message: "Product deleted" };
  }

  private async list(query: ProductListQuery, base: Prisma.ProductWhereInput) {
    const where: Prisma.ProductWhereInput = {
      AND: [
        base,
        query.categoryId ? { category: { OR: [{ id: query.categoryId }, { slug: query.categoryId }] } } : {},
        query.search
          ? {
              OR: [
                { name: { contains: query.search, mode: "insensitive" } },
                { description: { contains: query.search, mode: "insensitive" } },
              ],
            }
          : {},
      ],
    };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({ where, include, orderBy: this.sort(query.sort), ...pageArgs(query) }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products.map((product) => this.present(product)),
      meta: pageMeta(query.page, query.limit, total),
    };
  }

  private async ensureCategory(categoryId: string) {
    const category = await this.prisma.category.findFirst({
      where: { OR: [{ id: categoryId }, { slug: categoryId }] },
    });
    if (!category) throw new NotFoundException("Category not found");
    return category;
  }

  private async resolveSlug(explicit: string | undefined, name: string, excludeId?: string) {
    const isTaken = async (slug: string) =>
      (await this.prisma.product.count({ where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) } })) > 0;

    if (explicit) {
      if (await isTaken(explicit)) throw new ConflictException("That URL slug is already used by another product");
      return explicit;
    }
    return uniqueSlug(makeSlug(name, "product"), isTaken);
  }

  /** Orders the gallery, makes exactly one image primary and puts it first. */
  private normalizeImages(images: ProductImageDto[]) {
    if (!images.length || images.length > MAX_PRODUCT_IMAGES) {
      throw new BadRequestException(`A product must have between 1 and ${MAX_PRODUCT_IMAGES} images`);
    }
    const ordered = images
      .map((image, index) => ({ image, index }))
      .sort((a, b) => (a.image.position ?? a.index) - (b.image.position ?? b.index) || a.index - b.index)
      .map(({ image }) => image);
    const primaryIndex = Math.max(0, ordered.findIndex((image) => image.isPrimary));
    const [primary] = ordered.splice(primaryIndex, 1);
    return [primary, ...ordered].map((image, index) => ({
      key: image.key || image.url,
      url: image.url,
      alt: image.alt?.trim() || "Product image",
      isPrimary: index === 0,
      position: index,
    }));
  }

  private sort(sort: ProductSort): Prisma.ProductOrderByWithRelationInput[] {
    if (sort === "name_asc") return [{ name: "asc" }, { id: "asc" }];
    if (sort === "name_desc") return [{ name: "desc" }, { id: "asc" }];
    return [{ createdAt: sort === "createdAt_asc" ? "asc" : "desc" }, { id: "asc" }];
  }

  private present(product: ProductWithRelations) {
    const variants = product.variants.map((variant) => ({
      ...variant,
      availability: variant.stock > 0,
    }));
    const stock = variants.length
      ? variants.reduce((total, variant) => total + variant.stock, 0)
      : product.stock;

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      image: product.images[0]?.url ?? product.image ?? null,
      status: product.status,
      featured: product.featured,
      categoryId: product.categoryId,
      categorySlug: product.category.slug,
      categoryName: product.category.name,
      stock,
      inStock: stock > 0,
      availability: stock > 0,
      category: product.category,
      images: product.images,
      variants,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
