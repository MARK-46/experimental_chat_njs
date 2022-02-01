import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
} from 'typeorm';

@Entity({name: 'ex__auth_refresh_tokens'})
export class AuthRefreshTokenEntity {
    @PrimaryGeneratedColumn("uuid")
    public refresh_id: string;

    @Column({type: 'varchar', length: 36, nullable: false})
    public user_id: string;

    @Column({type: 'text', nullable: false})
    public refresh_token: string;

    @Column({type: 'datetime', nullable: false})
    public expires_at: Date;

    @CreateDateColumn({type: "timestamp", nullable: true})
    public created_at: Date;
}
