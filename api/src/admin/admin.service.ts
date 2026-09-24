import { Injectable } from "@nestjs/common";
import { ProductStatus, QuoteStatus } from "../generated/prisma/client.js";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalProducts,
      publishedProducts,
      draftProducts,
      outOfStockProducts,
      totalCategories,
      totalQuotes,
      pendingQuotes,
      acceptedQuotes,
      openContactMessages,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.product.count(),
      this.prisma.product.count({ where: { status: ProductStatus.PUBLISHED } }),
      this.prisma.product.count({ where: { status: ProductStatus.DRAFT } }),
      this.prisma.product.count({
        where: { status: ProductStatus.PUBLISHED, stock: 0, variants: { none: { stock: { gt: 0 } } } },
      }),
      this.prisma.category.count(),
      this.prisma.quote.count(),
      this.prisma.quote.count({ where: { status: QuoteStatus.PENDING } }),
      this.prisma.quote.count({ where: { status: QuoteStatus.ACCEPTED } }),
      this.prisma.contactMessage.count({ where: { handledAt: null } }),
    ]);

    return {
      totalUsers,
      totalProducts,
      publishedProducts,
      draftProducts,
      outOfStockProducts,
      totalCategories,
      totalQuotes,
      pendingQuotes,
      acceptedQuotes,
      openContactMessages,
    };
  }
}
