import { Body, Controller, Get, Param, Patch, Req, Delete, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UpdateMeDto } from './dto/updateMe.dto';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @UseGuards(JwtAuthGuard)
    @Get('me')
    findMe(@Req() req: any) {
        return this.userService.findMe(req.user.sub);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Get()
    findAll() {
        return this.userService.findAll();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Patch(':id/roles')
    assignRoles(@Param('id') id: string, @Body() assignRolesDto: AssignRolesDto) {
        return this.userService.assignRoles(id, assignRolesDto);
    }

    //Activar y desactivar usuario
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Patch(':id/activate')
    activateUser(@Param('id') id: string) {
        return this.userService.activateUser(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Patch(':id/deactivate')
    deactivateUser(@Param('id') id: string) {
        return this.userService.deactivateUser(id);
    }

    //Actualizar un campo de me usuario
    @UseGuards(JwtAuthGuard)
    @Patch('me')
    updateMe(@Req() req: any, @Body() updateMeDto: UpdateMeDto){
        return this.userService.updateMe(req.user.sub, updateMeDto)
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Delete(':id/roles/:roleName')
    removeRoleFromUser(@Param('id') id: string, @Param('roleName') roleName: string) {
        return this.userService.removeRoleFromUser(id, roleName);
    }
}