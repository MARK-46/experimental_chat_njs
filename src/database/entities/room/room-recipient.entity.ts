import { UserEntity } from '../user.entity';
import {
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity, OneToOne, JoinColumn
} from 'typeorm';
import {RoomRecipientTypesEnum} from "../../../bin/common/enum/room-recipient-types.enum";

@Entity({name: 'ex__room_message_recipients'})
export class RoomRecipientEntity extends BaseEntity {
    @Column({type: 'varchar', length: 130, nullable: false, primary: true})
    public recipient_room_id: string;

    @Column({type: 'varchar', length: 130, nullable: false, primary: true})
    public recipient_message_id: string;

    @Column({type: 'varchar', length: 130, nullable: false, primary: true})
    public recipient_user_id: string;

    @Column({type: 'integer', nullable: true, default: RoomRecipientTypesEnum.SERVER_RECEIVED})
    public recipient_type: number;

    @CreateDateColumn({type: "timestamp", nullable: true})
    public recipient_created_at: Date;

    @UpdateDateColumn({type: "timestamp", nullable: true})
    public recipient_updated_at: Date;

    /**
     * Relations
     */

     @OneToOne(() => UserEntity)
     @JoinColumn({referencedColumnName: 'user_id', name: 'recipient_user_id'})
     public recipient_user: UserEntity;
}
