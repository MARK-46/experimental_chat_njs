import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    BaseEntity, OneToOne, JoinColumn
} from 'typeorm';
import {UserEntity} from "./user.entity";

@Entity({name: 'ex__user_bans'})
export class UserBanEntity extends BaseEntity {
    @PrimaryGeneratedColumn() public ban_id: number;
    @Column({type: 'integer', nullable: false}) public ban_user_id: string;
    @Column({type: 'integer', nullable: true}) public ban_admin_id: string;
    @Column({type: 'integer', nullable: true, default: 1}) public ban_status: number;
    @Column({type: 'integer', nullable: true, default: 0}) public ban_type: number;
    @Column({type: 'text', nullable: true}) public ban_reason: string;
    @CreateDateColumn({type: "timestamp", nullable: true}) public ban_started: Date;
    @Column({type: "timestamp", nullable: true}) public ban_length: Date;

    /**
     * Relations
     */

    @OneToOne(() => UserEntity)
    @JoinColumn({referencedColumnName: 'user_id', name: 'ban_user_id'})
    public ban_user: UserEntity;

    @OneToOne(() => UserEntity)
    @JoinColumn({referencedColumnName: 'user_id', name: 'ban_admin_id'})
    public ban_admin: UserEntity;
}
