import { BadRequestException, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { DeleteObjectCommand, DeleteObjectsCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import { CreateUploadUrlDto } from "./dto/create-upload-url.dto.js";
import { ConfirmUploadDto } from "./dto/confirm-upload.dto.js";
import { UPLOAD_FOLDERS, UPLOAD_URL_TTL_SECONDS } from "./upload.constants.js";

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly accountId = process.env.R2_ACCOUNT_ID;
  private readonly accessKeyId = process.env.R2_ACCESS_KEY_ID;
  private readonly secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  private readonly bucketName = process.env.R2_BUCKET_NAME;
  private readonly publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
  private s3?: S3Client;

  async createUploadUrl(dto: CreateUploadUrlDto) {
    const client = this.client();
    const extension = dto.fileName.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
    const folder = dto.productId ? `products/${dto.productId}` : (dto.folder ?? "uploads");
    const key = `${folder}/${randomUUID()}.${extension}`;
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: dto.contentType,
      ContentLength: dto.size,
    });

    return {
      uploadUrl: await getSignedUrl(client, command, { expiresIn: UPLOAD_URL_TTL_SECONDS }),
      key,
      publicUrl: this.publicUrlFor(key),
    };
  }

  async confirmUpload(dto: ConfirmUploadDto) {
    this.assertManagedKey(dto.key);
    const client = this.client();
    let head;
    try {
      head = await client.send(new HeadObjectCommand({ Bucket: this.bucketName, Key: dto.key }));
    } catch {
      throw new BadRequestException("The uploaded file could not be found. Try uploading it again.");
    }
    if (head.ContentLength !== dto.size || head.ContentType !== dto.contentType) {
      throw new BadRequestException("The uploaded file does not match what was requested.");
    }
    return { key: dto.key, publicUrl: this.publicUrlFor(dto.key), contentType: dto.contentType, size: dto.size };
  }

  async deleteUpload(key: string) {
    this.assertManagedKey(key);
    await this.client().send(new DeleteObjectCommand({ Bucket: this.bucketName, Key: key }));
    return { message: "Upload deleted" };
  }

  /**
   * Removes objects that are no longer referenced, for example after a product
   * is deleted or its gallery is replaced. Failures are logged and swallowed
   * because an orphaned file must never block the change that caused it.
   */
  async deleteObjects(keys: string[]): Promise<void> {
    const managed = keys.filter((key) => this.isManagedKey(key));
    if (!managed.length || !this.isConfigured()) return;
    try {
      await this.client().send(
        new DeleteObjectsCommand({ Bucket: this.bucketName, Delete: { Objects: managed.map((Key) => ({ Key })), Quiet: true } }),
      );
    } catch (error) {
      this.logger.warn(`Could not delete ${managed.length} object(s): ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private isConfigured() {
    return Boolean(this.accountId && this.accessKeyId && this.secretAccessKey && this.bucketName);
  }

  private publicUrlFor(key: string) {
    if (!this.publicUrl) {
      throw new InternalServerErrorException("R2_PUBLIC_URL is not configured");
    }
    return `${this.publicUrl}/${key}`;
  }

  private isManagedKey(key: string) {
    return !key.includes("..") && UPLOAD_FOLDERS.some((folder) => key.startsWith(`${folder}/`));
  }

  private assertManagedKey(key: string) {
    if (!this.isManagedKey(key)) throw new BadRequestException("Unknown upload key");
  }

  private client() {
    if (!this.isConfigured()) {
      throw new InternalServerErrorException("R2 storage is not configured");
    }
    this.s3 ??= new S3Client({
      region: "auto",
      endpoint: `https://${this.accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: this.accessKeyId!, secretAccessKey: this.secretAccessKey! },
    });
    return this.s3;
  }
}
