import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRoleDto {
    @IsString()
    @IsNotEmpty()
    role_name!: string;

    @IsString()
    @IsOptional()
    description?: string;
}