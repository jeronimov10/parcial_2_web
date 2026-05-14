import { Body, Controller, Get, Post, Patch, Delete, UseGuards, Param, Req } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateStatusAppointmentDto } from './dto/update-status-appointment.dto';
import { AppoinmentService } from './appoinment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';


@Controller('appoinments')
export class AppoinmentController {

    constructor(private readonly appointmentService: AppoinmentService) {}

    //C
    @UseGuards(JwtAuthGuard)
    @Post()
    createMyAppointment(@Req() req: any, @Body() createAppointmentDto: CreateAppointmentDto) {
        return this.appointmentService.createMyAppointment(req.user.sub, createAppointmentDto);
    }

    //R - paciente ve sus citas
    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMyAppointments(@Req() req: any) {
        return this.appointmentService.getMyAppointments(req.user.sub);
    }

    // admin y doctor ven todas las citas
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'doctor')
    @Get('')
    getAllAppointments() {
        return this.appointmentService.getAllAppointments();
    }

    //U - doctor actualiza estado de cita
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('doctor')
    @Patch(':id')
    updateAppointment(@Param('id') appointmentId: string, @Body() updateStatusAppointmentDto: UpdateStatusAppointmentDto) {
        return this.appointmentService.updateAppointmentStatus(appointmentId, updateStatusAppointmentDto);
    }

    //D - paciente elimina su cita
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    deleteAppointment(@Req() req: any, @Param('id') appointmentId: string) {
        return this.appointmentService.deleteMyAppointment(req.user.sub, appointmentId);
    }
}
