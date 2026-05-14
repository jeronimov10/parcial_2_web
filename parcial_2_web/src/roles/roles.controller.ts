import { Body, Controller, Get, Post, Patch, UseGuards, Param } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UpdateRoleDto } from './dto/update-role.dto';
import { identity } from 'rxjs';

@Controller('roles')
export class RolesController {
    constructor(private readonly rolesService: RolesService) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Post()
    create(@Body() createRoleDto: CreateRoleDto) {
        return this.rolesService.create(createRoleDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Get()
    findAll() {
        return this.rolesService.findAll();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
        return this.rolesService.updateRole(id, updateRoleDto);
    }
}