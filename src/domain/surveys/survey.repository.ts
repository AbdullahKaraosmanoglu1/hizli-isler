import type { Survey } from './survey.entity';

export interface SurveyRepository {
    createInvite(requestId: number, invitedAt: Date): Promise<Survey>;
    findByRequestId(requestId: number): Promise<Survey | null>;
    answer(requestId: number, score: number, comment: string): Promise<Survey>;
}
export const SURVEY_REPOSITORY = Symbol('SURVEY_REPOSITORY');
