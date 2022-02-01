import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity, DeleteDateColumn
} from 'typeorm';

@Entity({ name: 'ex__rooms', orderBy: { room_updated_at: "DESC" } })
export class RoomEntity extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    public room_id: string;

    @Column({ type: 'varchar', length: 36, nullable: true })
    public room_last_message_id: string;

    @Column({ type: 'integer', nullable: true, default: 3 })
    public room_type: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    public room_name: string;

    @Column({ type: 'text', nullable: true })
    public room_image: string;

    @CreateDateColumn({ type: "timestamp", nullable: true })
    public room_created_at: Date;

    @UpdateDateColumn({ type: "timestamp", nullable: true })
    public room_updated_at: Date;

    @DeleteDateColumn({ type: "timestamp", nullable: true })
    public room_deleted_at: Date;
}
