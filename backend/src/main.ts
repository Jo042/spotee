import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { configureApp } from './configure-app';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  configureApp(app);

  const port = process.env.PORT ?? 4000;

  await app.listen(port);
  console.log(`Server is running on http://localhost:${port}`);
}
bootstrap();
