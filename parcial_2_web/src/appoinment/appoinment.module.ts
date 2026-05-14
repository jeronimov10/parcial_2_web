import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppoinmentService } from './appoinment.service';
import { AppoinmentController } from './appoinment.controller';
import { Appointment } from './appointment.entity';
import { User } from '../user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, User])],
  providers: [AppoinmentService],
  controllers: [AppoinmentController]
})
export class AppoinmentModule {}
