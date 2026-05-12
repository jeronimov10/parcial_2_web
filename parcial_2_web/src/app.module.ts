import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/user.entity';
import { Role } from './roles/roles.entity';
import { UserModule } from './user/user.module';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'postgres',
      password: 'Lacima12222431',
      database: 'parcial2_web_nest',
      entities: [User, Role],
      synchronize: true,
    }),
    UserModule,
    RolesModule,
  ],
})
export class AppModule {}