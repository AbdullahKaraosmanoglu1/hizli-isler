import { Test } from '@nestjs/testing';
import { INestApplication, CanActivate, ExecutionContext } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { CommandBus } from '@nestjs/cqrs';
import { AnyKeyGuard, ReportKeyGuard } from '../src/infrastructure/auth/api-key.guards';

class AllowGuard implements CanActivate {
    canActivate(_ctx: ExecutionContext) { return true; }
}

describe('HTTP (no DB)', () => {
    let app: INestApplication;

    const prismaMock = {
        request: { create: jest.fn(), findMany: jest.fn() },
        survey: { create: jest.fn(), findMany: jest.fn() },
    } as unknown as PrismaService;

    const busMock = {
        execute: jest.fn().mockResolvedValue({ success: true }),
        register: jest.fn(),
        bind: jest.fn(),
    } as any;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(PrismaService).useValue(prismaMock)
            .overrideProvider(CommandBus).useValue(busMock)

            // Global guard varsa tamamen serbest bırak
            .overrideProvider(APP_GUARD).useValue({ canActivate: () => true })

            // Controller seviyesindeki guard’ları gerçekten BYPASS et
            .overrideGuard(AnyKeyGuard).useValue({ canActivate: () => true })
            .overrideGuard(ReportKeyGuard).useValue({ canActivate: () => true })
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
            .expect((res) => { expect([200, 201]).toContain(res.status); });

        expect(res.body).toEqual({ success: true });
        expect(busMock.execute).toHaveBeenCalledTimes(1);
    }); describe

    it('POST /api/requests -> prisma.request.create mock ile döner', async () => {
        (prismaMock as any).request.create.mockResolvedValue({
            id: 1,
            citizen_name: 'Ali',
            phone: '555',
            address: 'X',
            category: 'Su',
            description: 'Arıza',
            status: 'ACIK',
        });

        const res = await request(app.getHttpServer())
            .post('/api/requests')
            .set('X-Api-Key', 'op-key-123')
            .send({ citizen_name: 'Ali', phone: '555', address: 'X', category: 'Su', description: 'Arıza' })
            .expect((res) => { expect([200, 201]).toContain(res.status); });

        expect(res.body.id).toBe(1);
        expect((prismaMock as any).request.create).toHaveBeenCalledTimes(1);
    });
});
