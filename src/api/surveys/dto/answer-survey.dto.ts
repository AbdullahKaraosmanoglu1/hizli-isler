import { IsInt, Max, Min, IsOptional, IsString } from 'class-validator';

export class AnswerSurveyDto {
    @IsInt() @Min(1) @Max(5) score!: number;
    @IsOptional() @IsString() comment?: string;
}