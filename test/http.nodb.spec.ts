// test/http.nodb.spec.ts
import { Test } from '@nestjs/testing';
import { INestApplication, CanActivate, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { CommandBus } from '@nestjs/cqrs';
import { AnyKeyGuard, ReportKeyGuard } from '../src/infrastructure/auth/api-key.guards';
import { CsvWriterService } from '../src/infrastructure/files/csv-writer.service';

class AllowGuard implements CanActivate {
    canActivate(_ctx: ExecutionContext) { return true; }
}

const createPrismaMock = () =>
({
    request: { create: jest.fn(), findMany: jest.fn() },
    survey: { create: jest.fn(), findMany: jest.fn() },
} as unknown as PrismaService);

describe('HTTP (no DB) — bus mocked', () => {
    let app: INestApplication;
    let prismaMock: PrismaService;

    const busMock = {
        execute: jest.fn().mockResolvedValue({ success: true }),
        register: jest.fn(),
        bind: jest.fn(),
    } as any;

    beforeAll(async () => {
        prismaMock = createPrismaMock();

        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(PrismaService).useValue(prismaMock)
            // Bu blokta CommandBus'ı mockluyoruz (Survey answer testinde kullanılacak)
            .overrideProvider(CommandBus).useValue(busMock)
            // Controller seviyesindeki guard’ları BYPASS et
            .overrideGuard(AnyKeyGuard).useValue(new AllowGuard())
            .overrideGuard(ReportKeyGuard).useValue(new AllowGuard())
            .compile();

        app = moduleRef.createNestApplication();
        app.setGlobalPrefix('api');
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('POST /api/surveys/:id/answer -> mocked bus sonucu döner', async () => {
        const res = await request(app.getHttpServer())
            .post('/api/surveys/42/answer')
            .send({ score: 5, comment: 'ok' })
            .expect((r) => { expect([200, 201]).toContain(r.status); });

        expect(res.body).toEqual({ success: true });
        expect(busMock.execute).toHaveBeenCalledTimes(1);
    });

    // test/http.nodb.spec.ts  (yalnızca ilgili test değişti)
    it('POST /api/requests -> CommandBus.execute sonucu döner', async () => {
        // Bu test izole olsun diye execute'u resetle
        busMock.execute.mockReset();

        // Controller'ın döndürmesini beklediğimiz sahte sonuç
        const created = {
            id: 1,
            citizen_name: 'Ali',
            phone: '555',
            address: 'X',
            category: 'Su',
            description: 'Arıza',
            status: 'ACIK',
        };
        busMock.execute.mockResolvedValueOnce(created);

        const res = await request(app.getHttpServer())
            .post('/api/requests')
            .set('X-Api-Key', 'op-key-123')
            .send({ citizen_name: 'Ali', phone: '555', address: 'X', category: 'Su', description: 'Arıza' })
            .expect((r) => { expect([200, 201]).toContain(r.status); });

        // Dönen gövde busMock.execute'in sonucuyla aynı olmalı
        expect(res.body).toEqual(created);
        expect(busMock.execute).toHaveBeenCalledTimes(1);
    });
});

describe('HTTP (no DB) — real /export/daily flow', () => {
    let app: INestApplication;
    let prismaMock: PrismaService;

    beforeAll(async () => {
        prismaMock = createPrismaMock();
        // ExportDaily gerçek handler çalışsın diye CommandBus’ı burada mocklamıyoruz

        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(PrismaService).useValue(prismaMock)
            .overrideGuard(AnyKeyGuard).useValue(new AllowGuard())
            .overrideGuard(ReportKeyGuard).useValue(new AllowGuard())
            .compile();

        app = moduleRef.createNestApplication();
        app.setGlobalPrefix('api');
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('POST /api/export/daily -> CsvWriterService.writeDaily çağrılır', async () => {
        // Bugünün aralığında veri çekildiğinde boş liste dönsün (I/O yapmayalım)
        (prismaMock as any).survey.findMany.mockResolvedValue([]);

        // CsvWriterService’i yakalayıp writeDaily’i stub’la
        const csv = app.get(CsvWriterService) as CsvWriterService;
        const writeSpy = jest.spyOn(csv, 'writeDaily').mockResolvedValue('/tmp/out.csv');

        const res = await request(app.getHttpServer())
            .post('/api/export/daily')
            .set('X-Api-Key', 'op-key-123')
            .expect((r) => { expect([200, 201]).toContain(r.status); });

        expect(writeSpy).toHaveBeenCalledTimes(1);
        // Argümanların şekli: filename (string), rows (array)
        const [filename, rows] = writeSpy.mock.calls[0];
        expect(typeof filename).toBe('string');
        expect(Array.isArray(rows)).toBe(true);

        // Handler tipik olarak { path, count } döndürür; burada en azından body’nin obje olduğunu doğrulayalım
        expect(typeof res.body).toBe('object');

        writeSpy.mockRestore();
    });
});
