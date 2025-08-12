import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMetricsSummaryQuery } from '../queries/get-summary.query';
import { PrismaService } from '../../../prisma/prisma.service';

@QueryHandler(GetMetricsSummaryQuery)
export class GetSummaryHandler implements IQueryHandler<GetMetricsSummaryQuery> {
    constructor(private readonly prisma: PrismaService) { }
    async execute() {
        const [resolved, scores] = await Promise.all([
            this.prisma.request.findMany({ where: { status: 'Çözüldü' }, select: { created_at: true, resolved_at: true } }),
            this.prisma.survey.findMany({ where: { score: { not: null } }, select: { score: true } }),
        ]);

        const avgResolutionHours =
            resolved.length === 0
                ? 0
                : resolved.reduce((sum, r) => sum + ((r.resolved_at!.getTime() - r.created_at.getTime()) / 36e5), 0) / resolved.length;

        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const resolved24h = await this.prisma.request.count({ where: { status: 'Çözüldü', resolved_at: { gte: since } } });

        const avgScore =
            scores.length === 0 ? 0 : scores.reduce((s, x) => s + (x.score ?? 0), 0) / scores.length;

        return { avg_resolution_hours: Number(avgResolutionHours.toFixed(2)), resolved_24h: resolved24h, avg_score: Number(avgScore.toFixed(2)) };
    }
}
