import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Appointment } from './appointment.entity';
import { Repository } from 'typeorm';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateStatusAppointmentDto } from './dto/update-status-appointment.dto';

@Injectable()
export class AppoinmentService {

    constructor(
            @InjectRepository(Appointment) private readonly appointmentRepository: Repository<Appointment>,
            @InjectRepository(User) private readonly userRepository: Repository<User>,
        ) {}

    async createMyAppointment(userId: string, createAppointmentDto: CreateAppointmentDto) {
        const user = await this.userRepository.findOne({
        where: { id: userId },
        });

        if (!user) {
        throw new NotFoundException('Usuario no encontrado');
        }

        const appointment = new Appointment();
        appointment.motivo = createAppointmentDto.motivo;
        appointment.appointment_date = new Date(createAppointmentDto.appointment_date);
        appointment.status = createAppointmentDto.status ?? 'pending';
        appointment.user = user;

        const savedAppointment = await this.appointmentRepository.save(appointment);

        return {
        message: 'Cita creada con éxito',
        appointmentId: savedAppointment.id,
        };
    }

    async getMyAppointments(userId: string) {
        const MyAppointments = await this.appointmentRepository.find({
        where: { user: { id: userId } },
        relations: ['user'],
        });

        if (!MyAppointments || MyAppointments.length === 0) {
        throw new NotFoundException('No se encontraron citas para este usuario');
        }

        return MyAppointments;
    }


    async getAllAppointments() {
        const appointments = await this.appointmentRepository.find({
        relations: ['user'],
        });
        if (!appointments || appointments.length === 0) {
        throw new NotFoundException('No se encontraron citas');
        }
        return appointments;
    }


    async updateAppointmentStatus(appointmentId: string, updateStatusAppointmentDto: UpdateStatusAppointmentDto) {
        const appointment = await this.appointmentRepository.findOne({
        where: { id: appointmentId },
        });

        if (!appointment) {
            throw new NotFoundException('cita no encontrada');
        }
        appointment.status = updateStatusAppointmentDto.status;
        await this.appointmentRepository.save(appointment);

        return {
            message: 'Estado de la cita actualizado con éxito',
        };

    }


    async deleteMyAppointment(userId: string, appointmentId: string) {
        const appointment = await this.appointmentRepository.findOne({
        where: { id: appointmentId, user: { id: userId } },
        });

        if(!appointment) {
            throw new NotFoundException('Cita no encontrada');
        }

        await this.appointmentRepository.remove(appointment);

        return {
            message: 'Cita eliminada con éxito',
        };

    }
}
