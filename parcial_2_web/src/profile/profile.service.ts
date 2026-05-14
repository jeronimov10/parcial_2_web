import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './profile.entity';
import { User } from '../user/user.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ReplaceProfileDto } from './dto/replace-profile.dto';

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(Profile) private readonly profileRepository: Repository<Profile>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ) {}

    async createMyProfile(userId: string, createProfileDto: CreateProfileDto) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['profile'],
        });

        if (!user) {
        throw new NotFoundException('Usuario no encontrado');
        }

        if (user.profile) {
        throw new ConflictException('El usuario ya tiene perfil');
        }

        const profile = new Profile();

        if (createProfileDto.bio !== undefined) {
        profile.bio = createProfileDto.bio;
        }

        if (createProfileDto.address !== undefined) {
        profile.address = createProfileDto.address;
        }

        if (createProfileDto.birth_date !== undefined) {
        profile.birthdate = createProfileDto.birth_date;
        }

        profile.user = user;

        const savedProfile = await this.profileRepository.save(profile);

        return {
        message: 'Perfil creado con éxito',
        profileId: savedProfile.id,
        };
    }

    async getMyProfile(userId: string) {
        const profile = await this.profileRepository.findOne({
        where: { user: { id: userId } },
        relations: ['user'],
        });

        if (!profile) {
        throw new NotFoundException('Perfil no encontrado');
        }

        return {
        id: profile.id,
        bio: profile.bio,
        address: profile.address,
        birth_date: profile.birthdate,
        created_at: profile.created_at,
        user: {
            id: profile.user.id,
            email: profile.user.email,
            name: profile.user.name,
        },
        };
    }

    async updateMyProfile(userId: string, updateProfileDto: UpdateProfileDto) {
        const profile = await this.profileRepository.findOne({
            where: { user: { id: userId } },
            relations: ['user'],
        });

        if (!profile) {
            throw new NotFoundException('Perfil no encontrado');
        }

        if (updateProfileDto.bio !== undefined) {
            profile.bio = updateProfileDto.bio;
        }

        if (updateProfileDto.address !== undefined) {
            profile.address = updateProfileDto.address;
        }

        if (updateProfileDto.birth_date !== undefined) {
            profile.birthdate = updateProfileDto.birth_date;
        }

        const updatedProfile = await this.profileRepository.save(profile);

        return {
            message: 'Perfil actualizado con éxito',
            profile: {
            id: updatedProfile.id,
            bio: updatedProfile.bio,
            address: updatedProfile.address,
            birth_date: updatedProfile.birthdate,
            created_at: updatedProfile.created_at,
            },
        };
        }

    async deleteMyProfile(userId: string) {
        const profile = await this.profileRepository.findOne({
            where: { user: { id: userId } },
        });

        if (!profile) {
            throw new NotFoundException('Perfil no encontrado');
        }

        await this.profileRepository.remove(profile);

        return {
            message: 'Perfil eliminado con éxito',
        };
        }

        async replaceMyProfile(userId: string, replaceProfileDto: ReplaceProfileDto){

            const profile = await this.profileRepository.findOne({
                where: { user: { id: userId } },
                relations: ['user'],
            });

            if (!profile){
                throw new NotFoundException('Perfil no encontrado');
            }

            profile.bio = replaceProfileDto.bio;
            profile.address = replaceProfileDto.address;
            profile.birthdate = replaceProfileDto.birthdate;

            const replacedProfile = await this.profileRepository.save(profile);

            return {
                message: 'Perfil actualizado con éxito',
                profile: {
                id: replacedProfile.id,
                bio: replacedProfile.bio,
                address: replacedProfile.address,
                birth_date: replacedProfile.birthdate,
                created_at: replacedProfile.created_at,
                },
            };
        }
}