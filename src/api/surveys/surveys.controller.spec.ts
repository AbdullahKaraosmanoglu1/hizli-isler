import { Test } from '@nestjs/testing';
import { SurveysController } from './surveys.controller';
import { CommandBus } from '@nestjs/cqrs';

describe('SurveysController', () => {
    it('answer() doğru komutu CommandBus’a iletir', async () => {
        const execute = jest.fn().mockResolvedValue({ ok: true });

        const module = await Test.createTestingModule({
            controllers: [SurveysController],
            providers: [{ provide: CommandBus, useValue: { execute } }],
        }).compile();

        const controller = module.get(SurveysController) as any;

        const call = controller.answer.bind(controller);
        if (call.length === 2) {
            await call(42, { score: 5, comment: 'Harika hizmet' });
        } else {
            await call(42, 5, 'Harika hizmet');
        }

        expect(execute).toHaveBeenCalledTimes(1);
        const sent: any = execute.mock.calls[0][0];
        expect(sent.requestId).toBe(42);
        expect(sent.score).toBe(5);
        expect(sent.comment).toBe('Harika hizmet');
    });
});
