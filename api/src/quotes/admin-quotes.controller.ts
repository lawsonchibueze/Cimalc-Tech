import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Roles, Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { auth } from '../auth/auth.js';
import { AdminQuotesQueryDto } from './dto/admin-quotes-query.dto.js';
import { CreateQuoteMessageDto } from './dto/create-quote-message.dto.js';
import { RespondToQuoteDto } from './dto/respond-to-quote.dto.js';
import { UpdateQuoteStatusDto } from './dto/update-quote-status.dto.js';
import { QuotesService } from './quotes.service.js';

@Roles(['ADMIN'])
@Controller('admin/quotes')
export class AdminQuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get()
  findAll(@Query() query: AdminQuotesQueryDto) {
    return this.quotesService.findAdmin(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quotesService.findAdminById(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateQuoteStatusDto) {
    return this.quotesService.updateStatus(id, dto);
  }

  @Post(':id/respond')
  respond(
    @Param('id') id: string,
    @Body() dto: RespondToQuoteDto,
    @Session() session: UserSession<typeof auth>,
  ) {
    return this.quotesService.respondToQuote(session.user.id, id, dto);
  }

  @Post(':id/messages')
  addMessage(
    @Param('id') id: string,
    @Body() dto: CreateQuoteMessageDto,
    @Session() session: UserSession<typeof auth>,
  ) {
    return this.quotesService.addAdminMessage(session.user.id, id, dto);
  }
}
