import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { AssignRolesDto } from './dto/assign-roles.dto';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    findAll() {
        return this.userService.findAll();
    }

    @Get('me')
    findMe() {
        return this.userService.findMe('id-temporal');
    }

    @Patch(':id/roles')
    assignRoles(@Param('id') id: string, @Body() assignRolesDto: AssignRolesDto) {
        return this.userService.assignRoles(id, assignRolesDto);
    }
}