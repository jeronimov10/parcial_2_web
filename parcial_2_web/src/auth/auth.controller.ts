import { Body, Controller, Post, Patch, Req, UseGuards } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/update-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';


@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    //Cambiar la contraseña

    @UseGuards(JwtAuthGuard)
    @Patch('change-password')
    changePassword(@Req() req: any, @Body() changePasswordDto: ChangePasswordDto) {
        return this.authService.changePassword(req.user.sub, changePasswordDto);
    }
}