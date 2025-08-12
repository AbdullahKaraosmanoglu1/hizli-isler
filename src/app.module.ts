import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from './prisma/prisma.module';

import { RequestsController } from './api/requests/requests.controller';
import { CreateRequestHandler } from './application/requests/handlers/create-request.handler';
import { AssignRequestHandler } from './application/requests/handlers/assign-request.handler';
import { ResolveRequestHandler } from './application/requests/handlers/resolve-request.handler';
import { REQUEST_REPOSITORY } from './domain/requests/request.repository';
import { RequestPrismaRepository } from './infrastructure/persistence/prisma/request.prisma.repository';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    CqrsModule,
    PrismaModule,
  ],
  controllers: [RequestsController],
  providers: [
    CreateRequestHandler,
    AssignRequestHandler,
    ResolveRequestHandler,
    { provide: REQUEST_REPOSITORY, useClass: RequestPrismaRepository },
  ],
})
export class AppModule { }
