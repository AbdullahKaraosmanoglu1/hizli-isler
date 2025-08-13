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
    private readonly delimiter = ';';

    async writeDaily(filename: string, rows: Row[]): Promise<string> {
        await fs.promises.mkdir(this.outDir, { recursive: true });
        const filePath = path.join(this.outDir, filename);

        const header = [
            'request_id',
            'score',
            'comment',
            'answered_at',
        ].join(this.delimiter);

        const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
        const fmtDate = (d: Date) => {
            const pad = (n: number) => String(n).padStart(2, '0');
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
        };

        const lines = [
            header,
            ...rows.map(r =>
                [
                    r.request_id,
                    r.score ?? '',
                    escape(r.comment ?? ''),
                    fmtDate(r.answered_at ?? new Date(0)),
                ].join(this.delimiter)
            ),
        ];

        await fs.promises.writeFile(filePath, lines.join('\n'), 'utf8');
        return filePath;
    }
}

