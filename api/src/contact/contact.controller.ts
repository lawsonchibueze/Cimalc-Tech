import { Body, Controller, Post } from "@nestjs/common";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import { CreateContactDto } from "./dto/create-contact.dto.js";

@AllowAnonymous()
@Controller("contact")
export class ContactController {
  @Post()
  create(@Body() dto: CreateContactDto) {
    return {
      success: true,
      message: "Your message has been received.",
      contact: { name: dto.name, email: dto.email },
    };
  }
}
