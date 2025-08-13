import { IsString } from 'class-validator';

export class CreateRequestDto {
    @IsString() citizen_name!: string;
    @IsString() phone!: string;
    @IsString() address!: string;
    @IsString() category!: string;
    @IsString() description!: string;
}
