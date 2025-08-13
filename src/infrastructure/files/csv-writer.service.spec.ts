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

    it('sanity', () => {
        expect(true).toBe(true);
    });

    it('";" ayırıcıyla yazar ve çift tırnakları doğru kaçar', async () => {
        const tmp = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'csv-test-'));

        // Env’i ÖNCE ayarla, sonra service yarat
        process.env.EXPORT_OUT_DIR = path.join(tmp, 'out', 'sftp');
        process.env.EXPORT_DELIMITER = ';';

        process.env.EXPORT_DELIMETER = ';'; // olası yazım farkı

        const svc = new CsvWriterService();

        const rows = [{
            request_id: 99,
            score: 4,
            comment: 'he said "ok"; then left',
            answered_at: new Date('2025-08-13T12:34:56Z'),
        }];

        const filePath = await svc.writeDaily('test.csv', rows);
        const abs = path.isAbsolute(filePath) ? filePath : path.resolve(filePath);

        const raw = await fs.promises.readFile(abs, 'utf8');

        // BOM ve CRLF normalizasyonu
        const normalized = raw.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').trim();
        const [header, data] = normalized.split('\n');

        console.log({ data }); // debug amaçlı

        expect(header).toBe('request_id;score;comment;answered_at');
        expect(data).toMatch(/^99;4;"he said ""ok""; then left";\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });
});
