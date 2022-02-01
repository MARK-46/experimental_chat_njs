import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    BaseEntity, OneToMany
} from 'typeorm';
import {UserBanEntity} from "./user-ban.entity";
import * as bCrypt from "bcryptjs";
import {UserRolesEnum} from "../../bin/common/enum/user-roles.enum";

@Entity({name: 'ex__users'})
export class UserEntity extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    public user_id: string;

    @Column({type: 'integer', nullable: true, default: UserRolesEnum.USER})
    public user_role: number;

    @Column({type: 'varchar', length: 255, nullable: false})
    public user_name: string;

    @Column({type: 'varchar', length: 255, nullable: true})
    public user_email: string;

    @Column({type: 'integer', nullable: true, default: 0})
    public user_status: number;

    @Column({type: 'integer', nullable: true, default: 1})
    public user_language_id: number;

    @Column({type: 'varchar', length: 255, nullable: false})
    public user_username: string;

    @Column({type: 'varchar', length: 255, nullable: false, select: true})
    public user_password: string;

    @Column({type: 'text', nullable: true})
    public user_image: string;

    @CreateDateColumn({type: "timestamp", nullable: true})
    public user_created_at: Date;

    @UpdateDateColumn({type: "timestamp", nullable: true})
    public user_updated_at: Date;

    @DeleteDateColumn({type: "timestamp", nullable: true})
    public user_deleted_at: Date;

    /**
     * Relations
     */

    @OneToMany(() => UserBanEntity, ban => ban.ban_user)
    public user_bans: UserBanEntity[];

    @OneToMany(() => UserBanEntity, ban => ban.ban_admin)
    public user_banned_clients: UserBanEntity[];

    public comparePassword(password: string): boolean {
        return bCrypt.compareSync(password, this.user_password);
    }
}
