import "dotenv/config";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { getAllowedOrigins } from "./common/origins.js";

async function bootstrap() {
  // Better Auth needs the raw request body, so Nest's own body parser is disabled.
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });
  const origins = getAllowedOrigins();
  app.enableCors({
    origin: origins.length ? origins : false,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );
  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 8000);
}
await bootstrap();
