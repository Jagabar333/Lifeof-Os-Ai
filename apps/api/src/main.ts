import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.setGlobalPrefix("api/v1");

  // Security
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.enableCors({
    origin: (process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000,http://localhost:3001,http://localhost:3002").split(","),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Filters & Interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  // Swagger
  const config = new DocumentBuilder()
    .setTitle("LifeOS AI API")
    .setDescription("The Intelligent Operating System For Your Life")
    .setVersion("1.0")
    .addBearerAuth()
    .addTag("auth")
    .addTag("users")
    .addTag("tasks")
    .addTag("calendar")
    .addTag("notes")
    .addTag("goals")
    .addTag("habits")
    .addTag("finance")
    .addTag("health")
    .addTag("ai")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = process.env["PORT"] ?? 4001;
  await app.listen(port, () => {
    logger.log(`LifeOS AI API listening on http://localhost:${port}`);
    logger.log(`Swagger docs at http://localhost:${port}/api/docs`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to bootstrap application", err);
  process.exit(1);
});
