import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetMetricsSummaryQuery } from '../../application/metrics/queries/get-summary.query';

@Controller('metrics')
export class MetricsController {
    constructor(private readonly bus: QueryBus) { }
    @Get('summary') getSummary() { return this.bus.execute(new GetMetricsSummaryQuery()); }
}
