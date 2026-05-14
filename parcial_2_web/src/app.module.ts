import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/user.entity';
import { Role } from './roles/roles.entity';
import { Profile } from './profile/profile.entity';
import { UserModule } from './user/user.module';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5433,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'Lacima12222431',
      database: process.env.DB_NAME || 'parcial2_web_nest',
      entities: [User, Role, Profile],
      synchronize: true,
    }),
    UserModule,
    RolesModule,
    AuthModule,
    ProfileModule,
  ],
  
})
export class AppModule {}