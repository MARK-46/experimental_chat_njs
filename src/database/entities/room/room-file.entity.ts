import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    BaseEntity, DeleteDateColumn
} from 'typeorm';

@Entity({name: 'ex__room_files'})
export class RoomFileEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    public file_id: string;

    @Column({type: 'varchar', length: 36, nullable: false})
    public file_room_id: string;

    @Column({type: 'varchar', length: 36, nullable: false})
    public file_message_id: string;

    @Column({type: 'varchar', length: 255, nullable: false})
    public file_name: string;

    @Column({type: 'text', nullable: false})
    public file_path: string;

    @Column({type: 'varchar', length: 255, nullable: false})
    public file_mime_type: string;

    @CreateDateColumn({type: "timestamp", nullable: true})
    public file_created_at: Date;

    @DeleteDateColumn({type: "timestamp", nullable: true})
    public file_deleted_at: Date;
}
