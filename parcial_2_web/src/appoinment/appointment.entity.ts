import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('appointments')
export class Appointment {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', nullable: true })
    motivo?: string;

    @Column({ type: 'timestamp', nullable: false })
    appointment_date!: Date;

    @Column({ type: 'varchar', default: 'pending' })
    status!: string;

    @CreateDateColumn({ type: 'timestamp' })
    created_at!: Date;

    @ManyToOne(() => User, (user) => user.appointment, { onDelete: 'CASCADE' })
    user!: User;
}
