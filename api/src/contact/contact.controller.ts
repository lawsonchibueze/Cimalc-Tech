import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { AllowAnonymous, Roles } from "@thallesp/nestjs-better-auth";
import { ContactQueryDto } from "./dto/contact-query.dto.js";
import { CreateContactDto } from "./dto/create-contact.dto.js";
import { MarkHandledDto } from "./dto/mark-handled.dto.js";
import { ContactService } from "./contact.service.js";

@Controller()
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @AllowAnonymous()
  @Post("contact")
  create(@Body() dto: CreateContactDto) {
    return this.contactService.create(dto);
  }

  @Roles(["ADMIN"])
  @Get("admin/contact-messages")
  findAll(@Query() query: ContactQueryDto) {
    return this.contactService.findAll(query);
  }

  @Roles(["ADMIN"])
  @Patch("admin/contact-messages/:id")
  setHandled(@Param("id") id: string, @Body() dto: MarkHandledDto) {
    return this.contactService.setHandled(id, dto.handled);
  }
}
