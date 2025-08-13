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
    private readonly outDir = path.resolve(process.env.EXPORT_OUT_DIR ?? 'out/sftp');
    private readonly delimiter = process.env.EXPORT_DELIMITER ?? ';';

    async writeDaily(filename: string, rows: Row[]): Promise<string> {
        await fs.promises.mkdir(this.outDir, { recursive: true });
        const filePath = path.join(this.outDir, filename);

        const header = ['request_id', 'score', 'comment', 'answered_at'].join(this.delimiter);

        const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
        const pad = (n: number) => String(n).padStart(2, '0');
        const fmtDate = (d: Date) => {
            const yyyy = d.getFullYear();
            const MM = pad(d.getMonth() + 1);
            const DD = pad(d.getDate());
            const hh = pad(d.getHours());
            const mm = pad(d.getMinutes());
            const ss = pad(d.getSeconds());
            return `${yyyy}-${MM}-${DD} ${hh}:${mm}:${ss}`;
        };

        const lines = rows.map((r) =>
            [
                r.request_id,
                r.score ?? '',
                escape(r.comment ?? ''),
                escape(r.answered_at ? fmtDate(new Date(r.answered_at)) : ''),
            ].join(this.delimiter),
        );

        const content = [header, ...lines].join('\r\n');
        await fs.promises.writeFile(filePath, '\uFEFF' + content, 'utf8');

        return filePath;
    }
}
