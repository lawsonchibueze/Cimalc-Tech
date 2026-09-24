import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, ProductStatus } from "../generated/prisma/client.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { ProductsQueryDto } from "./dto/products-query.dto.js";
import { CreateProductDto } from "./dto/create-product.dto.js";
import { UpdateProductDto } from "./dto/update-product.dto.js";

const include = {
  category: true,
  images: { orderBy: { position: "asc" } },
  variants: { orderBy: { name: "asc" } },
} as const;

type PublicProduct = Prisma.ProductGetPayload<{ include: typeof include }>;

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublished(query: ProductsQueryDto, extraWhere: Prisma.ProductWhereInput = {}) {
    const where: Prisma.ProductWhereInput = {
      ...extraWhere,
      ...(query.categoryId && {
        category: {
          OR: [{ id: query.categoryId }, { slug: query.categoryId }],
        },
      }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: "insensitive" } },
          { description: { contains: query.search, mode: "insensitive" } },
        ],
      }),
    };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include,
        orderBy: this.sort(query.sort),
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products.map((product) => this.publicProduct(product)),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findPublishedById(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug: id },
      include,
    });

    if (!product) throw new NotFoundException("Product not found");
    return this.publicProduct(product);
  }

  async findNewArrivals(query: ProductsQueryDto) {
    return this.findPublished({ ...query, sort: "createdAt_desc" });
  }

  async findFeatured(query: ProductsQueryDto) {
    return this.findPublished(query, { featured: true });
  }

  async findRelated(id: string, query: ProductsQueryDto) {
    const product = await this.prisma.product.findFirst({
      where: { slug: id },
      select: { categoryId: true },
    });
    if (!product) throw new NotFoundException("Product not found");
    return this.findPublished({ ...query, categoryId: product.categoryId });
  }

  findAdmin(query: ProductsQueryDto) {
    const where: Prisma.ProductWhereInput = {
      ...(query.categoryId && {
        category: { OR: [{ id: query.categoryId }, { slug: query.categoryId }] },
      }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: "insensitive" } },
          { description: { contains: query.search, mode: "insensitive" } },
        ],
      }),
    };
    return this.prisma.product.findMany({
      where,
      include,
      orderBy: this.sort(query.sort),
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
  }

  async findAdminById(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id }, include });
    if (!product) throw new NotFoundException("Product not found");
    return product;
  }

  async create(dto: CreateProductDto) {
    const category = await this.ensureCategory(dto.categoryId);
    const images = this.validateImages(dto.images);
    const { images: _images, ...productData } = dto;
    return this.prisma.product.create({
      data: {
        ...productData,
        categoryId: category.id,
        slug: dto.slug || this.makeSlug(dto.name),
        images: { create: images },
      },
      include,
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findById(id);
    const category = dto.categoryId ? await this.ensureCategory(dto.categoryId) : undefined;
    const images = dto.images ? this.validateImages(dto.images) : undefined;
    const { images: _images, ...productData } = dto;
    return this.prisma.$transaction(async (tx) => {
      if (images) await tx.productImage.deleteMany({ where: { productId: id } });
      return tx.product.update({
        where: { id },
        data: {
          ...productData,
          ...(category ? { categoryId: category.id } : {}),
          ...(dto.name && !dto.slug ? { slug: this.makeSlug(dto.name) } : {}),
          ...(images ? { images: { create: images } } : {}),
        },
        include,
      });
    });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.product.delete({ where: { id } });
    return { message: "Product deleted" };
  }

  private async findById(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException("Product not found");
    return product;
  }

  private async ensureCategory(categoryId: string) {
    const category = await this.prisma.category.findFirst({
      where: { OR: [{ id: categoryId }, { slug: categoryId }] },
    });
    if (!category) throw new NotFoundException("Category not found");
    return category;
  }

  private makeSlug(value: string) {
    return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  private validateImages(images: CreateProductDto["images"] | UpdateProductDto["images"]) {
    if (!images?.length || images.length > 5) {
      throw new BadRequestException("A product must have between 1 and 5 images");
    }
    if (images.filter((image) => image.isPrimary).length !== 1) {
      images[0].isPrimary = true;
      for (const [index, image] of images.entries()) image.isPrimary = index === 0;
    }
    return images.map((image, index) => ({
      key: image.key || image.url,
      url: image.url,
      alt: image.alt || "Product image",
      isPrimary: image.isPrimary ?? index === 0,
      position: image.position ?? index,
    }));
  }

  private sort(sort: ProductsQueryDto["sort"]): Prisma.ProductOrderByWithRelationInput {
    if (sort === "name_asc") return { name: "asc" };
    if (sort === "name_desc") return { name: "desc" };
    return { createdAt: sort === "createdAt_asc" ? "asc" : "desc" };
  }

  private publicProduct(product: PublicProduct) {
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
      image: product.image,
      categoryId: product.categoryId,
      categorySlug: product.category.slug,
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
