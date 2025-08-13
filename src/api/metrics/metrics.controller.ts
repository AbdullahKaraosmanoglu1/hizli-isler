import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportKeyGuard } from '../../infrastructure/auth/api-key.guards';
import { QueryBus } from '@nestjs/cqrs';
import { GetMetricsSummaryQuery } from '../../application/metrics/queries/get-summary.query';

@Controller('metrics')
@UseGuards(ReportKeyGuard)
export class MetricsController {
    constructor(private readonly bus: QueryBus) { }
    @Get('summary') getSummary() { return this.bus.execute(new GetMetricsSummaryQuery()); }
}
