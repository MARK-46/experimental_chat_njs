import {getCustomRepository} from "typeorm";
import {RoomFileService} from "./room-file.service";
import {RoomService} from "./room.service";
import {UserService} from "../user.service";
import {RoomMessageRepository} from "../../database/repositories/room/room-message.repository";
import {IService} from "../../bin/common/interfaces/service.interface";
import {RoomMessageDataModel} from "../../models/responses/room/room-message-data.model";
import {getCustomService} from "../../bin/utils/service-register.utility";
import {RoomRecipientService} from "./room-recipient.service";

export class RoomMessageService implements IService {
    private roomMessageRepo: RoomMessageRepository;

    async use(...args: any): Promise<void> {
        this.roomMessageRepo = getCustomRepository(RoomMessageRepository, "chat");
    }

    async allMessages(options?: any, expandFiles: boolean = true, expandReply: boolean = true, expandReplyFiles: boolean = true, expandRecipients: boolean = true): Promise<RoomMessageDataModel[]> {
        const rows = await this.roomMessageRepo.find(options);
        const messages = [];
        for (const row of rows) {
            messages.push(new RoomMessageDataModel(
                row.message_id,
                row.message_room_id,
                row.message_content,
                row.message_type,
                row.message_created_at,
                row.message_updated_at,
                await getCustomService(UserService).findByID(row.message_user_id, true),
                expandFiles ? await getCustomService(RoomFileService).findAll(row.message_room_id, row.message_id) : null,
                expandReply ? await this.findOne(row.message_reply_id, expandReplyFiles, false) : null,
                expandRecipients ? await getCustomService(RoomRecipientService).recipients(row.message_id) : null
            ));
        }
        return messages;
    }

    async findOne(message_id: string, expandFiles: boolean = true, expandReply: boolean = true,
                  expandReplyFiles: boolean = true, expandRecipients: boolean = true, withDeleted: boolean = false): Promise<RoomMessageDataModel | null> {
        const row = await this.roomMessageRepo.findOne({message_id}, {withDeleted});
        if (!row) {
            return null;
        }
        return new RoomMessageDataModel(
            row.message_id,
            row.message_room_id,
            row.message_content,
            row.message_type,
            row.message_created_at,
            row.message_updated_at,
            await getCustomService(UserService).findByID(row.message_user_id),
            expandFiles ? await getCustomService(RoomFileService).findAll(row.message_room_id, row.message_id) : null,
            expandReply ? await this.findOne(row.message_reply_id, expandReplyFiles, false) : null,
            expandRecipients ? await getCustomService(RoomRecipientService).recipients(row.message_id) : null
        );
    }

    async isAuthor(message_id: string, user_id: string): Promise<boolean> {
        const result = await this.roomMessageRepo.query(
            "SELECT EXISTS(SELECT message_room_id FROM ex__room_messages WHERE message_user_id = ? AND message_id = ?) AS _status;", [user_id, message_id]);
        return result[0]['_status'] == 1;
    }

    async exists(room_id: string, message_id: string): Promise<boolean> {
        const result = await this.roomMessageRepo.query(
            "SELECT EXISTS(SELECT message_room_id FROM ex__room_messages WHERE message_room_id = ? AND message_id = ?) AS _status;", [room_id, message_id]);
        return result[0]['_status'] == 1;
    }

    async create({message_room_id, message_reply_id, message_user_id, message_content, message_type}: any): Promise<RoomMessageDataModel | null> {
        const result = await this.roomMessageRepo.insert({
            message_room_id,
            message_reply_id,
            message_user_id,
            message_content,
            message_type
        });
        const message_id = result.identifiers.length > 0 ? result.identifiers[0]['message_id'] : null;
        if (!message_id)
            return null;

        await getCustomService(RoomService).updateLastMessage(message_room_id);
        return await this.findOne(message_id);
    }

    async update(room_id: string, message_id: string, {message_reply_id, message_content, message_type}: any): Promise<void> {
        await this.roomMessageRepo.update({message_room_id: room_id, message_id: message_id}, {
            message_reply_id,
            message_content,
            message_type
        });
    }

    async delete({message_id, message_room_id}: { message_id?: string, message_room_id?: string }): Promise<boolean> {
        if (await this.roomMessageRepo._delete({message_id, message_room_id})) {
            await getCustomService(RoomFileService).delete({file_message_id: message_id, file_room_id: message_room_id});
            if (message_room_id) {
                await getCustomService(RoomService).updateLastMessage(message_room_id);
            } else {
                const row = await this.roomMessageRepo.findOne({message_id}, {withDeleted: true});
                if (row) {
                    await getCustomService(RoomService).updateLastMessage(row.message_room_id);
                }
            }
            return true;
        }
        return false;
    }
}
