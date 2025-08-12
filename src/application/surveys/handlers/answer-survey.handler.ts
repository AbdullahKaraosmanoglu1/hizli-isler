import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AnswerSurveyCommand } from '../commands/answer-survey.command';
import { Inject, BadRequestException } from '@nestjs/common';
import { SURVEY_REPOSITORY } from '../../../domain/surveys/survey.repository';
import type { SurveyRepository } from '../../../domain/surveys/survey.repository';

@CommandHandler(AnswerSurveyCommand)
export class AnswerSurveyHandler implements ICommandHandler<AnswerSurveyCommand> {
    constructor(@Inject(SURVEY_REPOSITORY) private readonly repo: SurveyRepository) { }
    async execute({ requestId, score, comment }: AnswerSurveyCommand) {
        const invite = await this.repo.findByRequestId(requestId);
        if (!invite) throw new BadRequestException('Survey invite not found');
        return this.repo.answer(requestId, score, comment ?? '');
    }
}
