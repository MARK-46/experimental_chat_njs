import {EntityRepository, Repository} from "typeorm";
import {RoomMessageEntity} from "../../entities/room/room-message.entity";

@EntityRepository(RoomMessageEntity)
export class RoomMessageRepository extends Repository<RoomMessageEntity> {
    async _delete({message_id, message_room_id}: { message_id?: string, message_room_id?: string }): Promise<boolean> {
        if (message_id || message_room_id) {
            const query = {};
            if (message_id) query['message_id'] = message_id;
            if (message_room_id) query['message_room_id'] = message_room_id;
            const result = await this.softDelete(query);
            return result && result.affected == 1;
        }
        return false;
    }
}
