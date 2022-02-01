import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity, DeleteDateColumn
} from 'typeorm';

@Entity({name: 'ex__room_messages', orderBy: { message_created_at: "ASC" }})
export class RoomMessageEntity extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    public message_id: string;

    @Column({type: 'varchar', length: 36, nullable: false})
    public message_room_id: string;

    @Column({type: 'varchar', length: 36, nullable: false})
    public message_user_id: string;

    @Column({type: 'varchar', length: 36, nullable: true})
    public message_reply_id: string;

    @Column({type: 'text', nullable: true})
    public message_content: string;

    @Column({type: 'integer', nullable: true, default: 0})
    public message_type: number;

    @CreateDateColumn({type: "timestamp", nullable: true})
    public message_created_at: Date;

    @UpdateDateColumn({type: "timestamp", nullable: true})
    public message_updated_at: Date;

    @DeleteDateColumn({type: "timestamp", nullable: true})
    public message_deleted_at: Date;
}
