import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { ConflictException } from "@nestjs/common";
import { CreateCategoryDto } from "./dto/create-category.dto.js";
import { UpdateCategoryDto } from "./dto/update-category.dto.js";

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({
      orderBy: { name: "asc" },
    });
  }

  async findOne(slug: string) {
    const category = await this.prisma.category.findFirst({
      where: { OR: [{ slug }, { id: slug }] },
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    return category;
  }

  findProducts(id: string) {
    return this.prisma.product.findMany({
      where: { category: { OR: [{ slug: id }, { id }] }, status: "PUBLISHED" },
      include: { category: true, images: { orderBy: { position: "asc" } }, variants: true },
      orderBy: { createdAt: "desc" },
    });
  }

  create(dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: { ...dto, slug: dto.slug || this.makeSlug(dto.name) },
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findById(id);
    return this.prisma.category.update({
      where: { id },
      data: { ...dto, ...(dto.name && !dto.slug ? { slug: this.makeSlug(dto.name) } : {}) },
    });
  }

  async remove(id: string) {
    await this.findById(id);

    try {
      await this.prisma.category.delete({ where: { id } });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Foreign key constraint")) {
        throw new ConflictException("Category has products and cannot be deleted");
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

  private makeSlug(value: string) {
    return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
}
