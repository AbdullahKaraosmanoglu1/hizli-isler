// src/infrastructure/files/csv-writer.service.spec.ts
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { CsvWriterService } from './csv-writer.service';

describe('CsvWriterService', () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...OLD_ENV };
    });

    afterEach(() => {
        process.env = OLD_ENV;
    });

    it('";" ile yazar, comment’i tırnaklar ve tarih tırnaksızdır', async () => {
        const tmp = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'csv-test-'));

        process.env.EXPORT_OUT_DIR = path.join(tmp, 'out', 'sftp');
        process.env.EXPORT_DELIMITER = ';';

        const svc = new CsvWriterService();

        const rows = [{
            request_id: 99,
            score: 4,
            comment: 'he said "ok"; then left',
            answered_at: new Date('2025-08-13T12:34:56'),
        }];

        const file = await svc.writeDaily('test.csv', rows);

        const raw = await fs.promises.readFile(file, 'utf8');
        const normalized = raw.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').trim();
        const [header, data] = normalized.split('\n');

        expect(header).toBe('request_id;score;comment;answered_at');
        // comment tırnaklı, tarih tırnaksız
        expect(data).toMatch(/^99;4;"he said ""ok""; then left";\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });

    it('null ve undefined alanları boş bırakır', async () => {
        const tmp = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'csv-test-'));
        process.env.EXPORT_OUT_DIR = path.join(tmp, 'out', 'sftp');
        process.env.EXPORT_DELIMITER = ';';   // ⬅️ ÖNEMLİ: her testte açıkça ayarla

        const svc = new CsvWriterService();

        const rows = [{ request_id: 1, score: null, comment: null, answered_at: null }];
        const file = await svc.writeDaily('n.csv', rows);

        const raw = await fs.promises.readFile(file, 'utf8');
        const normalized = raw.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').trim();
        const line = normalized.split('\n')[1]; // data satırı

        expect(line).toBe('1;;"";');
    });

});
