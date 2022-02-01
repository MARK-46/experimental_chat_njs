import { getCustomRepository } from "typeorm";
import { IService } from "../../bin/common/interfaces/service.interface";
import {RoomRecipientRepository} from "../../database/repositories/room/room-recipient.repository";
import {RoomRecipientTypesEnum} from "../../bin/common/enum/room-recipient-types.enum";
import {UserDataModel} from "../../models/responses/user-data.model";
import {getCustomService} from "../../bin/utils/service-register.utility";
import {RoomMessageService} from "./room-message.service";

export class RoomRecipientService implements IService {
    private roomRecipientRepo: RoomRecipientRepository;

    async use(...args: any): Promise<void> {
        this.roomRecipientRepo = getCustomRepository(RoomRecipientRepository, "chat");
    }

    async setType(room_id: string, message_id: string, user_id: string, type: RoomRecipientTypesEnum): Promise<boolean> {
        if (await getCustomService(RoomMessageService).isAuthor(message_id, user_id)) {
            return false;
        }
        const recipient = await this.roomRecipientRepo._find(room_id, message_id, user_id);
        if (recipient) {
            if (recipient.recipient_type == type) {
                return false;
            }
            return await this.roomRecipientRepo._update(room_id, message_id, user_id, type);
        }
        return await this.roomRecipientRepo._create(room_id, message_id, user_id, type);
    }

    async recipients(message_id: string): Promise<UserDataModel[]> {
        const rows = await this.roomRecipientRepo.find({ where: { recipient_message_id: message_id }, relations: ['recipient_user'] });
        const recipients = [];
        for (const row of rows) {
            if (row.recipient_user) {
                recipients.push(new UserDataModel(
                    row.recipient_user.user_id,
                    row.recipient_user.user_role,
                    row.recipient_user.user_name,
                    row.recipient_user.user_email,
                    row.recipient_user.user_status,
                    row.recipient_user.user_username,
                    row.recipient_user.user_image,
                    row.recipient_user.user_created_at,
                    row.recipient_user.user_updated_at,
                    row.recipient_type
                ));
            }
        }
        return recipients;
    }

    async getRNMCount(user_id: string, room_id: string): Promise<number> {
        const rows = await this.roomRecipientRepo.query(`SELECT COUNT(*) AS room_nrm_count FROM (
            SELECT ex__room_message_recipients.recipient_type FROM ex__room_messages  
            LEFT JOIN ex__room_message_recipients ON recipient_message_id = message_id AND recipient_user_id = ? 
            WHERE message_room_id = ? AND message_user_id != ? AND message_deleted_at IS NULL AND (recipient_type IS NULL OR recipient_type != 3)
            ) AS temp;`, [user_id, room_id, user_id]);
        return rows[0]['room_nrm_count'];
    }
}
