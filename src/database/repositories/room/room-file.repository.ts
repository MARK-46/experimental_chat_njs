import {EntityRepository, Repository} from "typeorm";
import {RoomFileEntity} from "../../entities/room/room-file.entity";
import moment from "moment";

@EntityRepository(RoomFileEntity)
export class RoomFileRepository extends Repository<RoomFileEntity> {
    async _delete({file_id, file_room_id, file_message_id}: { file_id?: string, file_room_id?: string, file_message_id?: string }): Promise<boolean> {
        if (file_id || file_room_id || file_message_id) {
            const query = {};
            if (file_id) query['file_id'] = file_id;
            if (file_room_id) query['file_room_id'] = file_room_id;
            if (file_message_id) query['file_message_id'] = file_message_id;

            const result = await this.update(query, {file_deleted_at: moment().toDate()});
            return result && result.affected == 1;
        }
        return false;
    }
}
