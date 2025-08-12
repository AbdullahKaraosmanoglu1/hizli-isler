import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import type { SurveyRepository } from '../../../domain/surveys/survey.repository';
import type { Survey } from '../../../domain/surveys/survey.entity';

@Injectable()
export class SurveyPrismaRepository implements SurveyRepository {
    constructor(private readonly prisma: PrismaService) { }

    async createInvite(requestId: number, invitedAt: Date): Promise<Survey> {
        return this.prisma.survey.create({
            data: { request_id: requestId, invited_at: invitedAt },
        }) as any;
    }

    async findByRequestId(requestId: number): Promise<Survey | null> {
        return (await this.prisma.survey.findUnique({
            where: { request_id: requestId },
        })) as any;
    }

    async answer(requestId: number, score: number, comment: string): Promise<Survey> {
        return this.prisma.survey.update({
            where: { request_id: requestId },
            data: { score, comment, answered_at: new Date() },
        }) as any;
    }
}
