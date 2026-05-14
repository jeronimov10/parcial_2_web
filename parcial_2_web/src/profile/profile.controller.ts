import { Body, Controller, Delete, Get, Patch, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ReplaceProfileDto } from './dto/replace-profile.dto';

@Controller('users/me/profile')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    createMyProfile(@Req() req: any, @Body() createProfileDto: CreateProfileDto) {
        return this.profileService.createMyProfile(req.user.sub, createProfileDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    getMyProfile(@Req() req: any) {
        return this.profileService.getMyProfile(req.user.sub);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('')
    updateMyProfile(@Req() req: any, @Body() updateProfileDto: UpdateProfileDto) {
        return this.profileService.updateMyProfile(req.user.sub, updateProfileDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete()
    deleteMyProfile(@Req() req: any){
        return this.profileService.deleteMyProfile(req.user.sub);

    }

    @UseGuards(JwtAuthGuard)
    @Put()
    replaceMyProfile(@Req() req: any, @Body() replaceProfileDto: ReplaceProfileDto){
        return this.profileService.replaceMyProfile(req.user.sub, replaceProfileDto);
    }
}
