import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useBodyParser('json', { limit: '7mb' });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  serveUi(app, globalPrefix);
  const port = app.get(ConfigService).getOrThrow<number>('PLANNER_SERVER_PORT');
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

/**
 * Serves the built Angular UI (when present) from the same origin as the API,
 * falling back to index.html so client-side routes can be deep-linked.
 */
function serveUi(app: NestExpressApplication, globalPrefix: string) {
  const uiPath = resolve(process.env['UI_DIST_PATH'] ?? join(__dirname, 'ui'));
  const indexHtml = join(uiPath, 'index.html');
  if (!existsSync(indexHtml)) {
    return;
  }

  app.useStaticAssets(uiPath, { index: false });
  const apiPrefix = `/${globalPrefix}`;
  app.use((req: Request, res: Response, next: NextFunction) => {
    const isApiRequest = req.path === apiPrefix || req.path.startsWith(`${apiPrefix}/`);
    if ((req.method !== 'GET' && req.method !== 'HEAD') || isApiRequest) {
      next();
      return;
    }
    res.sendFile(indexHtml);
  });
  Logger.log(`Serving UI from ${uiPath}`);
}

bootstrap();
