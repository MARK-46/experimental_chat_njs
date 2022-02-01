import {EntityRepository, Repository} from "typeorm";
import {RoomRecipientEntity} from "../../entities/room/room-recipient.entity";
import {RoomRecipientTypesEnum} from "../../../bin/common/enum/room-recipient-types.enum";

@EntityRepository(RoomRecipientEntity)
export class RoomRecipientRepository extends Repository<RoomRecipientEntity> {
    async _find(room_id: string, message_id: string, user_id: string): Promise<RoomRecipientEntity | null> {
        if (!room_id || !message_id || !user_id) return null;
        return await this.findOne({where: {
            recipient_room_id: room_id,
            recipient_message_id: message_id,
            recipient_user_id: user_id,
        }});
    }

    async _exists(room_id: string, message_id: string, user_id: string): Promise<boolean> {
        if (!room_id || !message_id || !user_id) return false;
        const result = await this.query(
                `SELECT EXISTS(SELECT recipient_room_id
                               FROM ex__room_message_recipients
                               WHERE recipient_room_id = ?
                                 AND recipient_message_id = ?
                                 AND recipient_user_id = ?) AS _status;`, [
                room_id, message_id, user_id
            ]);
        return result[0]['_status'] == 1;
    }

    async _create(room_id: string, message_id: string, user_id: string, type: RoomRecipientTypesEnum): Promise<boolean> {
        if (room_id && message_id && user_id && type) {
            const result = await this.insert({
                recipient_room_id: room_id,
                recipient_message_id: message_id,
                recipient_user_id: user_id,
                recipient_type: type
            });
            return result.identifiers.length > 0;
        }
        return false;
    }

    async _update(room_id: string, message_id: string, user_id: string, type: RoomRecipientTypesEnum): Promise<boolean> {
        if (room_id && message_id && user_id && type) {
            const result = await this.update({
                recipient_room_id: room_id,
                recipient_message_id: message_id,
                recipient_user_id: user_id
            }, {
                recipient_type: type
            });
            return result && result.affected == 1;
        }
        return false;
    }
}
