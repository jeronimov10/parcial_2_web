import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateRoleDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    role_name!: string;

    @IsString()
    @IsOptional()
    description?: string;
}