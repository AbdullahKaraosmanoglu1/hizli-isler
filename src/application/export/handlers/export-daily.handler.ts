import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ExportDailyCommand } from '../commands/export-daily.command';
import { PrismaService } from '../../../prisma/prisma.service';
import { CsvWriterService } from '../../../infrastructure/files/csv-writer.service';
import { format } from 'date-fns';

@CommandHandler(ExportDailyCommand)
export class ExportDailyHandler implements ICommandHandler<ExportDailyCommand> {
    constructor(private prisma: PrismaService, private csv: CsvWriterService) { }

    async execute() {
        const start = new Date(); start.setHours(0, 0, 0, 0);
        const end = new Date(); end.setHours(23, 59, 59, 999);

        const rows = await this.prisma.survey.findMany({
            where: { answered_at: { gte: start, lte: end } },
            select: { request_id: true, score: true, comment: true, answered_at: true },
            orderBy: { answered_at: 'asc' },
        });

        const cleaned = rows.map(r => ({
            request_id: r.request_id,
            score: r.score ?? 0,
            comment: r.comment ?? '',
            answered_at: r.answered_at ?? new Date(0),
        }));

        const filename = `${format(new Date(), 'yyyy-MM-dd_HHmmss')}_survey_report.csv`;

        const filePath = await this.csv.writeDaily(filename, cleaned);
        return { path: filePath, count: rows.length };
    }
}
