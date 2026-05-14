import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class ReplaceProfileDto {
    @IsString()
    @IsNotEmpty()
    bio!: string;

    @IsString()
    @IsNotEmpty()
    address!: string;

    @IsDateString()
    @IsNotEmpty()
    birthdate!: string;
}