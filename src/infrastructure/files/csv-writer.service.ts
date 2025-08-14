import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

type Row = {
    request_id: number;
    score: number | null;
    comment: string | null;
    answered_at: Date | null;
};

@Injectable()
export class CsvWriterService {
    private readonly outDir = path.join(process.cwd(), 'out', 'sftp');
    private readonly delimiter = process.env.EXPORT_DELIMITER ?? ';';

    private escape(s: string) {
        return `"${s.replace(/"/g, '""')}"`;
    }

    private fmtDate(d?: Date | null): string {
        if (!d) return '';
        const t = d.getTime();
        if (!Number.isFinite(t) || Number.isNaN(t)) return '';
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
            `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }

    async writeDaily(filename: string, rows: Row[]): Promise<string> {
        await fs.promises.mkdir(this.outDir, { recursive: true });
        const filePath = path.join(this.outDir, filename);

        const header = [
            'request_id',
            'score',
            'comment',
            'answered_at',
        ].join(this.delimiter);

        const lines = rows.map((r) => [
            String(r.request_id),
            r.score ?? '',
            this.escape(r.comment ?? ''),
            this.fmtDate(r.answered_at),
        ].join(this.delimiter));

        const content = [header, ...lines].join('\n') + '\n';
        await fs.promises.writeFile(filePath, content, 'utf8');
        return filePath;
    }
}
