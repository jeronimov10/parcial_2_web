import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
    @IsString()
    @IsOptional()
    bio?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsDateString()
    @IsOptional()
    birth_date?: string;
}