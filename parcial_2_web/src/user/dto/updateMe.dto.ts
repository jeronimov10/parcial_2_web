import { IsDateString, IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateMeDto {
    @IsString()
    @IsOptional()
    @IsEmail()
    email?: string;

    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    phone?: string;
}