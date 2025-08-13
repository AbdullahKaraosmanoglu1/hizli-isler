import { ExportDailyHandler } from './export-daily.handler';
import { PrismaService } from '../../../prisma/prisma.service';
import { CsvWriterService } from '../../../infrastructure/files/csv-writer.service';

describe('ExportDailyHandler', () => {
    it('bugünün aralığında veriyi çekip CSV yazar (passthrough)', async () => {
        const rows = [
            { request_id: 1, score: 5, comment: 'ok', answered_at: new Date('2025-08-13T10:00:00Z') },
            { request_id: 2, score: null, comment: null, answered_at: null },
        ];

        const prisma = { survey: { findMany: jest.fn().mockResolvedValue(rows) } } as unknown as PrismaService;
        const writeDaily = jest.fn().mockResolvedValue('/tmp/foo.csv');
        const csv = { writeDaily } as unknown as CsvWriterService;

        const handler = new ExportDailyHandler(prisma, csv);
        const result = await handler.execute();

        expect((prisma as any).survey.findMany).toHaveBeenCalledTimes(1);
        expect(writeDaily).toHaveBeenCalledTimes(1);

        const [filename, data] = writeDaily.mock.calls[0];
        expect(typeof filename).toBe('string');
        expect(Array.isArray(data)).toBe(true);
        expect(data[0]).toEqual(rows[0]);
        expect(result).toMatchObject({ path: '/tmp/foo.csv', count: rows.length });
    });
});
