import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ExportDailyCommand } from '../commands/export-daily.command';
import { PrismaService } from '../../../prisma/prisma.service';
import { CsvWriterService } from '../../../infrastructure/files/csv-writer.service';
import { startOfDay, endOfDay, format } from 'date-fns';

@CommandHandler(ExportDailyCommand)
export class ExportDailyHandler implements ICommandHandler<ExportDailyCommand> {
    constructor(private prisma: PrismaService, private csv: CsvWriterService) { }

    async execute() {
        const start = startOfDay(new Date());
        const end = endOfDay(new Date());

        const rows = await this.prisma.survey.findMany({
            where: { answered_at: { gte: start, lte: end } },
            select: { request_id: true, score: true, comment: true, answered_at: true },
            orderBy: { answered_at: 'asc' },
        });
        console.log(rows);

        const cleaned = rows.map((r) => ({
            request_id: r.request_id,
            score: r.score ?? null,
            comment: r.comment ?? '',
            answered_at: r.answered_at ?? null,
        }));

        const day = format(start, 'yyyy-MM-dd');
        const stamp = format(new Date(), 'HHmmss');
        const filename = `${day}_${stamp}_survey_report.csv`;

        const path = await this.csv.writeDaily(filename, cleaned);
        return { path, count: rows.length };
    }
}
