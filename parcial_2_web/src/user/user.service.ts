import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from './user.entity';
import { Role } from '../roles/roles.entity';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { UpdateMeDto } from './dto/updateMe.dto';

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

    //Metodos para activar y desactivar usuarios
    async deactivateUser(id: string) {
        const user = await this.userRepository.findOne({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        user.is_active = false;
        await this.userRepository.save(user);

        return {
            message: 'Usuario desactivado con éxito',
        };
        }

    async activateUser(id: string) {
        const user = await this.userRepository.findOne({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        user.is_active = true;
        await this.userRepository.save(user);

        return {
            message: 'Usuario activado con éxito',
        };
        }

    // Metodo para actualizar tu info de usuario me
    async updateMe(userId: string, updateMeDto: UpdateMeDto) {
        const user = await this.userRepository.findOne({
            where: { id: userId},
        });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }


        if (updateMeDto.email !== undefined) {
            user.email = updateMeDto.email;
        }

        if (updateMeDto.name !== undefined) {
            user.name = updateMeDto.name;
        }

        if (updateMeDto.phone !== undefined) {
            user.phone = updateMeDto.phone;
        }

        const updatedProfile = await this.userRepository.save(user);

        return {
            message: 'Perfil actualizado con éxito',
            profile: {
            id: updatedProfile.id,
            bio: updatedProfile.email,
            address: updatedProfile.name,
            phone: updatedProfile.phone,
            created_at: updatedProfile.created_at,
            },
        };
        

    }

    //Eliminar un rol a un usuario dado su ID
    async removeRoleFromUser(userId: string, roleName: string) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['roles'],
        });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        const hasRole = user.roles.some((role) => role.role_name === roleName);

        if (!hasRole) {
            throw new NotFoundException('El usuario no tiene ese rol');
        }

        user.roles = user.roles.filter((role) => role.role_name !== roleName);

        await this.userRepository.save(user);

        return {
            message: 'Rol removido del usuario con éxito',
        };
        }
}