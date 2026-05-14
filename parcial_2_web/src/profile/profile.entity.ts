import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('profiles')
export class Profile {

    //Atributos en la BD
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({type: 'varchar', nullable: true})
    bio?: string;

    @Column({type: 'varchar', nullable: true})
    address?: string;

    @Column({type: 'date', nullable: true})
    birthdate?: string;

    @CreateDateColumn()
    created_at!: Date;

    //Relaciones

    @OneToOne(() => User, (user) => user.profile)
    @JoinColumn({name: 'user_id'})
    user!: User;


}