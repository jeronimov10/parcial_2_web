import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './profile.entity';
import { User } from '../user/user.entity';

@Module({
  
  imports: [TypeOrmModule.forFeature([Profile, User])], //Aca se ven cuales son los repositorios que vamos a usar de la BD
  providers: [ProfileService],
  controllers: [ProfileController],
  exports: [ProfileService, TypeOrmModule],
})
export class ProfileModule {}
