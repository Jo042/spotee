import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Railway のプロキシを1段挟むため、req.ip を X-Forwarded-For の
  // 最後の値（プロキシが付けた接続元）から取る。回数制限の識別に使う
  app.set('trust proxy', 1);

  // whitelist: 検証デコレーターの無いプロパティを落とす
  // transform: 受け取った素のオブジェクトをクラスのインスタンスにする
  //            （インスタンス化しないとデコレーターが読み取られない）
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  const port = process.env.PORT ?? 4000;

  await app.listen(port);
  console.log(`Server is running on http://localhost:${port}`);
}
bootstrap();
