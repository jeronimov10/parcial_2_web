import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './roles.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
    // Repositorio role es el que me deja interactuar con la base de datos, osea me permite hacer consultas, interacciones, etc
    constructor(
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
    ) {}

    // Metodo para crear un nuevo rol, recibe un DTO con los datos del rol a crear, verifica si ya existe ese nombre de rol, si no existe, crea el rol y lo guarda en la BD
    async create(createRoleDto: CreateRoleDto) {
        const existingRole = await this.roleRepository.findOne({
        where: { role_name: createRoleDto.role_name },
        });

        if (existingRole) {
        throw new ConflictException('role_name ya existe');
        }

        const role = this.roleRepository.create(createRoleDto);
        const savedRole = await this.roleRepository.save(role);

        return {
        message: 'Rol creado con éxito',
        roleId: savedRole.id,
        };
    }

    // Los async se usan para: peticiones HTTP, acceso a bases de datos o temporizadores
    // Metodo para listar tods los roles
    async findAll() {
        try {
        return await this.roleRepository.find({
            select: ['id', 'role_name', 'description'],
        });
        } catch {
        throw new InternalServerErrorException('Error al obtener roles');
        }
    }

    //Metdo para actualizar un rol
    async updateRole(id: string, updateRoleDto: UpdateRoleDto) {
        const role = await this.roleRepository.findOne({
            where: { id },
        });

        if (!role) {
            throw new NotFoundException('Rol no encontrado');
        }

        if (updateRoleDto.role_name !== undefined) {
            const existingRole = await this.roleRepository.findOne({
            where: { role_name: updateRoleDto.role_name },
            });

            if (existingRole && existingRole.id !== id) {
            throw new ConflictException('role_name ya existe');
            }

            role.role_name = updateRoleDto.role_name;
        }

        if (updateRoleDto.description !== undefined) {
            role.description = updateRoleDto.description;
        }

        const updatedRole = await this.roleRepository.save(role);

        return {
            message: 'Rol actualizado con éxito',
            role: {
            id: updatedRole.id,
            role_name: updatedRole.role_name,
            description: updatedRole.description,
            },
        };
        }
}