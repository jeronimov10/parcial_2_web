import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';


export class CreateAppointmentDto {
    @IsString()
    @IsNotEmpty()
    motivo!: string;

    @IsDateString()
    appointment_date!: string;

    @IsString()
    @IsOptional()
    status?: string;
}