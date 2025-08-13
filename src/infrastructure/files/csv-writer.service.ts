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

    private resolveDelimiter(): string {
        const raw = (process.env.EXPORT_DELIMITER ?? process.env.EXPORT_DELIMETER ?? '').trim();
        return raw.length ? raw : ';';
    }
    private readonly delimiter = this.resolveDelimiter();

    async writeDaily(filename: string, rows: Row[]): Promise<string> {
        await fs.promises.mkdir(this.outDir, { recursive: true });
        const filePath = path.join(this.outDir, filename);

        const header = ['request_id', 'score', 'comment', 'answered_at'].join(this.delimiter);

        const escapeComment = (s: string) => `"${s.replace(/"/g, '""')}"`;
        const fmtDate = (d: Date) => {
            const pad = (n: number) => String(n).padStart(2, '0');
            const yyyy = d.getFullYear();
            const MM = pad(d.getMonth() + 1);
            const dd = pad(d.getDate());
            const HH = pad(d.getHours());
            const mm = pad(d.getMinutes());
            const ss = pad(d.getSeconds());
            return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}`;
        };

        const lines = rows.map((r) => {
            const id = r.request_id ?? '';
            const score = r.score ?? '';
            const comment = escapeComment(r.comment ?? '');
            const answered =
                r.answered_at instanceof Date
                    ? fmtDate(r.answered_at)
                    : r.answered_at
                        ? fmtDate(new Date(r.answered_at))
                        : '';
            return [id, score, comment, answered].join(this.delimiter);
        });

        const content = [header, ...lines].join('\r\n');
        await fs.promises.writeFile(filePath, '\uFEFF' + content, 'utf8');
        return filePath;
    }
}
