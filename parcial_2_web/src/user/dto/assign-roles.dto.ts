import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class AssignRolesDto {
    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty()
    roles!: string[];
}