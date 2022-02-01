import { UserEntity } from '../../entities/user.entity';
import {
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity, DeleteDateColumn, PrimaryColumn, OneToOne, JoinColumn
} from 'typeorm';
import {UserRolesEnum} from "../../../bin/common/enum/user-roles.enum";

@Entity({name: 'ex__room_members'})
export class RoomMemberEntity extends BaseEntity {
    @Column({type: 'varchar', length: 130, nullable: false, primary: true})
    public member_room_id: string;

    @Column({type: 'varchar', length: 130, nullable: false, primary: true})
    public member_user_id: string;

    @Column({type: 'integer', nullable: true, default: UserRolesEnum.USER})
    public member_role: number;

    @CreateDateColumn({type: "timestamp", nullable: true})
    public member_created_at: Date;

    @UpdateDateColumn({type: "timestamp", nullable: true})
    public member_updated_at: Date;

    @DeleteDateColumn({type: "timestamp", nullable: true})
    public member_deleted_at: Date;

    /**
     * Relations
     */

     @OneToOne(() => UserEntity)
     @JoinColumn({referencedColumnName: 'user_id', name: 'member_user_id'})
     public member_user: UserEntity;
}
