import { Injectable, NotFoundException } from "@nestjs/common";
import { QuoteStatus } from "../generated/prisma/client.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { CreateQuoteDto } from "./dto/create-quote.dto.js";
import { CreateQuoteMessageDto } from "./dto/create-quote-message.dto.js";
import { UpdateQuoteStatusDto } from "./dto/update-quote-status.dto.js";

const include = {
  items: { include: { product: true } },
  messages: { orderBy: { createdAt: "asc" as const } },
} as const;

@Injectable()
export class QuotesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateQuoteDto, userId?: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId },
    });
    if (!product) throw new NotFoundException("Product not found");

    const quote = await this.prisma.quote.create({
      data: {
        reference: `Q-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 10000)}`,
        customerName: dto.customerName,
        email: dto.email,
        phone: dto.phone,
        message: dto.message,
        userId,
        items: { create: { productId: dto.productId, quantity: dto.quantity } },
      },
      include,
    });
    return this.present(quote);
  }

  async findMine(userId: string) {
    const quotes = await this.prisma.quote.findMany({ where: { userId }, include, orderBy: { createdAt: "desc" } });
    return quotes.map((quote) => this.present(quote));
  }

  async findMineById(userId: string, id: string) {
    const quote = await this.prisma.quote.findFirst({ where: { id, userId }, include });
    if (!quote) throw new NotFoundException("Quote not found");
    return this.present(quote);
  }

  async cancel(userId: string, id: string) {
    const quote = await this.findMineById(userId, id);
    if (![QuoteStatus.PENDING, QuoteStatus.REVIEWING].includes(quote.status)) {
      return quote;
    }
    const updated = await this.prisma.quote.update({
      where: { id },
      data: { status: QuoteStatus.CANCELLED, cancelledAt: new Date() },
      include,
    });
    return this.present(updated);
  }

  async addMessage(userId: string | undefined, id: string, dto: CreateQuoteMessageDto) {
    const quote = userId
      ? await this.findMineById(userId, id)
      : await this.findPublicById(id);
    await this.prisma.quoteMessage.create({ data: { quoteId: quote.id, userId, body: dto.body } });
    return this.findPublicById(id);
  }

  async findAdmin() {
    const quotes = await this.prisma.quote.findMany({ include, orderBy: { createdAt: "desc" } });
    return quotes.map((quote) => this.present(quote));
  }

  async findAdminById(id: string) {
    const quote = await this.prisma.quote.findUnique({ where: { id }, include });
    if (!quote) throw new NotFoundException("Quote not found");
    return this.present(quote);
  }

  async updateStatus(id: string, dto: UpdateQuoteStatusDto) {
    await this.findAdminById(id);
    const updated = await this.prisma.quote.update({ where: { id }, data: { status: dto.status }, include });
    return this.present(updated);
  }

  async addAdminMessage(id: string, dto: CreateQuoteMessageDto) {
    await this.findAdminById(id);
    await this.prisma.quoteMessage.create({ data: { quoteId: id, body: dto.body } });
    return this.findAdminById(id);
  }

  private findPublicById(id: string) {
    return this.findAdminById(id);
  }

  private present(quote: any) {
    return {
      id: quote.id,
      reference: quote.reference,
      status: quote.status,
      submittedAt: quote.createdAt,
      customer: {
        name: quote.customerName,
        email: quote.email,
        phone: quote.phone,
      },
      productLines: quote.items,
      messages: quote.messages,
      nextStepMessage: "Our team will review your request and contact you with a quote.",
    };
  }
}
