import { IsString } from 'class-validator';

export class AssignRequestDto {
    @IsString() assigned_to!: string;
}