export class AnswerSurveyCommand {
    constructor(
        public readonly requestId: number,
        public readonly score: number,
        public readonly comment?: string,
    ) { }
}
