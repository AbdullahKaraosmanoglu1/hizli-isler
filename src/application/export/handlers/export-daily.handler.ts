import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ExportDailyCommand } from '../commands/export-daily.command';
import { PrismaService } from '../../../prisma/prisma.service';
import { CsvWriterService } from '../../../infrastructure/files/csv-writer.service';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';

@CommandHandler(ExportDailyCommand)
export class ExportDailyHandler implements ICommandHandler<ExportDailyCommand> {
    constructor(private prisma: PrismaService, private csv: CsvWriterService) { }

    async execute() {
        // Son 1 hafta: bugün dahil önceki 6 gün
        const end = endOfDay(new Date());
        const start = startOfDay(subDays(new Date(), 6));

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

        // Dosya adına tarih aralığını da koydum
        const filename = `${format(start, 'yyyyMMdd')}_${format(end, 'yyyyMMdd')}_survey_report.csv`;

        const filePath = await this.csv.writeDaily(filename, cleaned);
        return { path: filePath, count: rows.length, range: { start, end } };
    }
}
