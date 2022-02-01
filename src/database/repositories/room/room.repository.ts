import { EntityRepository, Repository } from "typeorm";
import { FindManyOptions } from "typeorm/find-options/FindManyOptions";
import { RoomEntity } from "../../entities/room/room.entity";
import moment from "moment";

@EntityRepository(RoomEntity)
export class RoomRepository extends Repository<RoomEntity> {
    async _find(opt: FindManyOptions<RoomEntity>): Promise<RoomEntity[]> {
        return await this.find(opt);
    }

    async _delete(room_id: string): Promise<boolean> {
        if (!room_id) return false;
        const result = await this.update({ room_id: room_id }, { room_deleted_at: moment().toDate() });
        return result && result.affected == 1;
    }

    async _updateLastMessage(room_id: string): Promise<void> {
        if (!room_id) return;
        await this.query(`UPDATE ex__rooms
                          SET room_last_message_id = (SELECT message_id
                                                      FROM ex__room_messages
                                                      WHERE message_room_id = ?
                                                        AND message_deleted_at IS NULL
                                                      ORDER BY message_created_at DESC
                                                      LIMIT 1)
                          WHERE room_id = ?;`, [room_id, room_id]);
    }
}
