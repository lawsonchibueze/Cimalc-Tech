import { Body, Controller, Param, Patch, Post } from "@nestjs/common";
import { OptionalAuth, Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { auth } from "../auth/auth.js";
import { CreateQuoteDto } from "./dto/create-quote.dto.js";
import { CreateQuoteMessageDto } from "./dto/create-quote-message.dto.js";
import { QuotesService } from "./quotes.service.js";

@Controller("quotes")
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  /** Guests can request a quote. Signed in customers get it attached to their account. */
  @Post()
  @OptionalAuth()
  create(@Body() dto: CreateQuoteDto, @Session() session?: UserSession<typeof auth>) {
    return this.quotesService.create(dto, session?.user);
  }

  @Patch(":id/cancel")
  cancel(@Param("id") id: string, @Session() session: UserSession<typeof auth>) {
    return this.quotesService.cancel(session.user, id);
  }

  @Post(":id/messages")
  addMessage(@Param("id") id: string, @Body() dto: CreateQuoteMessageDto, @Session() session: UserSession<typeof auth>) {
    return this.quotesService.addMessage(session.user, id, dto);
  }
}
