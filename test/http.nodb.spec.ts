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
            .overrideProvider(CommandBus).useValue(busMock)
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

    it('POST /api/requests -> CommandBus.execute sonucu döner', async () => {
        busMock.execute.mockReset();

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

        expect(res.body).toEqual(created);
        expect(busMock.execute).toHaveBeenCalledTimes(1);
    });
});

describe('HTTP (no DB) — real /export/daily flow', () => {
    let app: INestApplication;
    let prismaMock: PrismaService;

    beforeAll(async () => {
        prismaMock = createPrismaMock();

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
        (prismaMock as any).survey.findMany.mockResolvedValue([]);

        const csv = app.get(CsvWriterService) as CsvWriterService;
        const writeSpy = jest.spyOn(csv, 'writeDaily').mockResolvedValue('/tmp/out.csv');

        const res = await request(app.getHttpServer())
            .post('/api/export/daily')
            .set('X-Api-Key', 'op-key-123')
            .expect((r) => { expect([200, 201]).toContain(r.status); });

        expect(writeSpy).toHaveBeenCalledTimes(1);
        const [filename, rows] = writeSpy.mock.calls[0];
        expect(typeof filename).toBe('string');
        expect(Array.isArray(rows)).toBe(true);

        expect(typeof res.body).toBe('object');

        writeSpy.mockRestore();
    });
});
