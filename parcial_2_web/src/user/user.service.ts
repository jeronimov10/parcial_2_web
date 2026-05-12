import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from './user.entity';
import { Role } from '../roles/roles.entity';
import { AssignRolesDto } from './dto/assign-roles.dto';

@Injectable()
export class UserService {
    //Constructor de las tablas que vamos a usar de la BD
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    ) {}

    //Metodo para encontrar mi usuario
    async findMe(userId: string) {
        const user = await this.userRepository.findOne({
        where: { id: userId },
        //Type ORM no trae automatico los roles, esto se usa para traer los roles relacionados con el usuario
        relations: ['roles'],
        });

        if (!user) {
        throw new NotFoundException('Usuario no encontrado');
        }

        return {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        roles: user.roles.map((role) => role.role_name),
        };
    }

    // Metodo para listar todos los usuarios
    async findAll() {
        try {
        const users = await this.userRepository.find({
            relations: ['roles'],
        });

        return users.map((user) => ({
            id: user.id,
            email: user.email,
            name: user.name,
            roles: user.roles.map((role) => role.role_name),
        }));
        } catch {
        throw new InternalServerErrorException('Error al listar usuarios');
        }
    }

    //Metodo para asignar un rol a un usuario dado su ID y un DTO con los nombres de los roles a asignar
    async assignRoles(userId: string, assignRolesDto: AssignRolesDto) {
        const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['roles'],
        });

        if (!user) {
        throw new NotFoundException('Usuario no encontrado');
        }

        const roles = await this.roleRepository.find({
        where: { role_name: In(assignRolesDto.roles) },
        });

        if (roles.length !== assignRolesDto.roles.length) {
        throw new BadRequestException('roles inválidos');
        }

        user.roles = roles;
        await this.userRepository.save(user);

        return {
        message: 'Roles asignados',
        };
    }
}