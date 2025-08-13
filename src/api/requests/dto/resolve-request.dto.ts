import { IsDateString } from 'class-validator';

export class ResolveRequestDto {
    @IsDateString() resolved_at!: string;
}