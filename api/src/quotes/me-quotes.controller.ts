import { Controller, Get, Param } from "@nestjs/common";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { auth } from "../auth/auth.js";
import { QuotesService } from "./quotes.service.js";

@Controller("me/quotes")
export class MeQuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get()
  findAll(@Session() session: UserSession<typeof auth>) {
    return this.quotesService.findMine(session.user);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @Session() session: UserSession<typeof auth>) {
    return this.quotesService.findMineById(session.user, id);
  }
}
