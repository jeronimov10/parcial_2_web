import { ConflictException, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,

    ) {}

    async register(registerDto: RegisterDto) {
        const existingUser = await this.userRepository.findOne({
        where: { email: registerDto.email },
        });

        if (existingUser) {
        throw new ConflictException('Email ya registrado');
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        const user = this.userRepository.create({
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
        phone: registerDto.phone,
        });

        const savedUser = await this.userRepository.save(user);

        return {
        message: 'Usuario registrado con éxito',
        userId: savedUser.id,
        };
    }

    async login(loginDto: LoginDto) {
        const user = await this.userRepository.findOne({
        where: { email: loginDto.email },
        relations: ['roles'],
        });

        if (!user) {
        throw new UnauthorizedException('Credenciales incorrectas');
        }

        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

        if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciales incorrectas');
        }

        if (!user.is_active) {
        throw new HttpException('Usuario desactivado', HttpStatus.LOCKED);
        }

        const payload = {
        sub: user.id,
        email: user.email,
        roles: user.roles.map((role) => role.role_name),
        };

        const accessToken = this.jwtService.sign(payload);

        return {
        access_token: accessToken,
        };
    }
}