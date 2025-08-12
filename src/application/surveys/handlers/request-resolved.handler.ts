import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { RequestResolvedEvent } from '../../requests/events/request-resolved.event';
import { Inject } from '@nestjs/common';
import { SURVEY_REPOSITORY } from '../../../domain/surveys/survey.repository';
import type { SurveyRepository } from '../../../domain/surveys/survey.repository';

@EventsHandler(RequestResolvedEvent)
export class RequestResolvedEventHandler implements IEventHandler<RequestResolvedEvent> {
    constructor(@Inject(SURVEY_REPOSITORY) private readonly repo: SurveyRepository) { }
    async handle(e: RequestResolvedEvent) {
        const existing = await this.repo.findByRequestId(e.requestId);
        if (!existing) await this.repo.createInvite(e.requestId, new Date());
    }
}
