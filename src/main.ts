import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  const cfg = app.get(ConfigService);
  await app.listen(cfg.get<number>('PORT') ?? 5000);
}
bootstrap();
