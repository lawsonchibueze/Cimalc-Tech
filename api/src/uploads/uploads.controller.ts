import { Body, Controller, Delete, Post, Query } from "@nestjs/common";
import { Roles } from "@thallesp/nestjs-better-auth";
import { CreateUploadUrlDto } from "./dto/create-upload-url.dto.js";
import { ConfirmUploadDto } from "./dto/confirm-upload.dto.js";
import { UploadsService } from "./uploads.service.js";

@Roles(["ADMIN"])
@Controller("admin/uploads")
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post("presign")
  createUploadUrl(@Body() dto: CreateUploadUrlDto) {
    return this.uploadsService.createUploadUrl(dto);
  }

  @Post("confirm")
  confirmUpload(@Body() dto: ConfirmUploadDto) {
    return this.uploadsService.confirmUpload(dto);
  }

  /** The key contains slashes, so it travels as a query parameter rather than a path segment. */
  @Delete()
  deleteUpload(@Query("key") key: string) {
    return this.uploadsService.deleteUpload(key);
  }
}
