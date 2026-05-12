import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', unique: true, nullable: false })
    role_name!: string;

    @Column({ type: 'varchar', nullable: true })
    description?: string;

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date;

    @ManyToMany(() => User, (user) => user.roles)
    users!: User[];
}