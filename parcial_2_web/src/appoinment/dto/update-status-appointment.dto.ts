import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateStatusAppointmentDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    status!: string;
}