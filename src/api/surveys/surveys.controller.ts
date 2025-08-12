import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AnswerSurveyCommand } from '../../application/surveys/commands/answer-survey.command';

@Controller('surveys')
export class SurveysController {
    constructor(private readonly bus: CommandBus) { }
    @Post(':requestId/answer')
    answer(
        @Param('requestId', ParseIntPipe) requestId: number,
        @Body('score') score: number,
        @Body('comment') comment?: string,
    ) {
        return this.bus.execute(new AnswerSurveyCommand(requestId, Number(score), comment));
    }
}
