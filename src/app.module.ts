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
import { SURVEY_REPOSITORY } from './domain/surveys/survey.repository';
import { RequestPrismaRepository } from './infrastructure/persistence/prisma/request.prisma.repository';
import { SurveyPrismaRepository } from './infrastructure/persistence/prisma/survey.prisma.repository';
import { DailyExportJob } from './infrastructure/sched/daily-export.job';
import { SurveysController } from './api/surveys/surveys.controller';
import { RequestResolvedEventHandler } from './application/surveys/handlers/request-resolved.handler';
import { AnswerSurveyHandler } from './application/surveys/handlers/answer-survey.handler';
import { MetricsController } from './api/metrics/metrics.controller';
import { GetSummaryHandler } from './application/metrics/handlers/get-summary.handler';
import { ExportController } from './api/export/export.controller';
import { ExportDailyHandler } from './application/export/handlers/export-daily.handler';
import { CsvWriterService } from './infrastructure/files/csv-writer.service';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    CqrsModule,
    PrismaModule,
  ],
  controllers: [
    RequestsController,
    SurveysController,
    MetricsController,
    ExportController,
  ],
  providers: [
    CreateRequestHandler,
    AssignRequestHandler,
    ResolveRequestHandler,
    DailyExportJob,
    RequestResolvedEventHandler,
    AnswerSurveyHandler,
    GetSummaryHandler,
    ExportDailyHandler,
    CsvWriterService,
    { provide: REQUEST_REPOSITORY, useClass: RequestPrismaRepository },
    { provide: SURVEY_REPOSITORY, useClass: SurveyPrismaRepository },
  ],
})
export class AppModule { }
