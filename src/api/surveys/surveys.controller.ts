import { Body, Controller, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AnswerSurveyCommand } from '../../application/surveys/commands/answer-survey.command';
import { AnswerSurveyDto } from './dto/answer-survey.dto';

@Controller('surveys')
export class SurveysController {
    constructor(private readonly bus: CommandBus) { }

    @Post(':requestId/answer')
    answer(
        @Param('requestId', ParseIntPipe) requestId: number,
        @Body() body: AnswerSurveyDto,
    ) {
        return this.bus.execute(new AnswerSurveyCommand(requestId, Number(body.score), body.comment));
    }
}
