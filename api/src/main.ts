import "dotenv/config";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  // Railway deployment trigger: runtime behavior is unchanged.
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });
  const uiUrl = process.env.UI_URL;
  app.enableCors({
    origin: uiUrl ? [uiUrl] : false,
    credentials: true,
  });
  
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );
  await app.listen(process.env.PORT ?? 8000);
}
await bootstrap();
