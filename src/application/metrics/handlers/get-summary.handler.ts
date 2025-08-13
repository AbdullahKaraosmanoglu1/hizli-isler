import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMetricsSummaryQuery } from '../queries/get-summary.query';
import { PrismaService } from '../../../prisma/prisma.service';
import { subHours } from 'date-fns';

@QueryHandler(GetMetricsSummaryQuery)
export class GetSummaryHandler implements IQueryHandler<GetMetricsSummaryQuery> {
    constructor(private readonly prisma: PrismaService) { }

    async execute() {
        const avgRows = await this.prisma.$queryRaw<{ avg_hours: number | null }[]>`
      SELECT AVG(EXTRACT(EPOCH FROM ("resolved_at" - "created_at")) / 3600) AS avg_hours
      FROM "Request"
      WHERE "status" = 'Çözüldü' AND "resolved_at" IS NOT NULL
    `;
        const avg_resolution_hours = Number(avgRows?.[0]?.avg_hours ?? 0);

        const since = subHours(new Date(), 24);
        const resolved_24h = await this.prisma.request.count({
            where: { status: 'Çözüldü', resolved_at: { gte: since } },
        });

        const agg = await this.prisma.survey.aggregate({
            _avg: { score: true },
            where: { answered_at: { not: null } },
        });
        const avg_score = Number(agg._avg.score ?? 0);
        console.log(avg_resolution_hours);
        console.log(resolved_24h);
        return { avg_resolution_hours, resolved_24h, avg_score };
    }
}
