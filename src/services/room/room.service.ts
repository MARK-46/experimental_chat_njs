import {getCustomRepository} from "typeorm";
import {v1 as uuid} from "uuid";
import {RoomMessageService} from "./room-message.service";
import {IService} from "../../bin/common/interfaces/service.interface";
import {RoomRepository} from "../../database/repositories/room/room.repository";
import {RoomDataModel} from "../../models/responses/room/room-data.model";
import {getCustomService} from "../../bin/utils/service-register.utility";
import {RoomMemberService} from "./room-member.service";
import {RoomFileService} from "./room-file.service";
import { RoomRecipientService } from "../../services/room/room-recipient.service";

export class RoomService implements IService {
    private roomRepo: RoomRepository;

    async use(...args: any): Promise<void> {
        this.roomRepo = getCustomRepository(RoomRepository, "chat");
    }

    async allRooms(options?: any, expandLastMessage: boolean = true, expandLastMessageFiles: boolean = true,
                   expandLastMessageReply: boolean = false, expandLastMessageReplyFiles: boolean = false, expandRNM: boolean | string = false): Promise<RoomDataModel[]> {
        const rows = await this.roomRepo._find(options);
        const rooms = [];
        for (const row of rows) {
            const room = new RoomDataModel(
                row.room_id,
                row.room_type,
                row.room_name,
                row.room_image,
                row.room_created_at,
                row.room_updated_at
            );
            if (expandLastMessage) {
                room.room_last_message = await getCustomService(RoomMessageService)
                    .findOne(row.room_last_message_id, expandLastMessageFiles, expandLastMessageReply, expandLastMessageReplyFiles, false);
            }
            if (expandRNM) {
                room.room_nrm_count = await getCustomService(RoomRecipientService).getRNMCount(expandRNM as string, room.room_id);
            }
            rooms.push(room);
        }
        return rooms;
    }

    async findOne(room_id: string, expandLastMessage: boolean = true, expandMembers: boolean = true, withDeleted: boolean = false, expandRNM: boolean | string = false): Promise<RoomDataModel | null> {
        const row = await this.roomRepo.findOne({room_id: room_id}, {withDeleted});
        if (row) {
            const room = new RoomDataModel(
                row.room_id,
                row.room_type,
                row.room_name,
                row.room_image,
                row.room_created_at,
                row.room_updated_at
            );
            if (expandLastMessage) {
                room.room_last_message = await getCustomService(RoomMessageService).findOne(row.room_last_message_id, true, false, false, false);
            }
            if (expandMembers) {
                room.room_members = await getCustomService(RoomMemberService).memberList(row.room_id);
            }
            if (expandRNM) {
                room.room_nrm_count = await getCustomService(RoomRecipientService).getRNMCount(expandRNM as string, room.room_id);
            }
            return room;
        }
        return null;
    }

    async exists(room_id: string): Promise<boolean> {
        const result = await this.roomRepo.query(
            "SELECT EXISTS(SELECT room_id FROM ex__rooms WHERE room_id = ?) AS _status;", [room_id]);
        return result[0]['_status'] == 1;
    }

    async create({room_id, room_type, room_name, room_image}: any, user_id: string): Promise<RoomDataModel | null> {
        const result = await this.roomRepo.insert({room_id: room_id || uuid(), room_type, room_name, room_image});
        room_id = result.identifiers.length > 0 ? result.identifiers[0]['room_id'] : null;
        if (!room_id)
            return null;
        return await this.findOne(room_id, true, true, true, user_id);
    }

    async update(room_id: string, {room_type, room_name, room_image}: any, user_id: string): Promise<RoomDataModel | null> {
        await this.roomRepo.update(room_id, {room_type, room_name, room_image});
        return await this.findOne(room_id, true, true, true, user_id);
    }

    async updateLastMessage(room_id: string): Promise<void> {
        await this.roomRepo._updateLastMessage(room_id);
    }

    async availableRoomIdList(user_id: string): Promise<string[]> {
        const rows = await this.roomRepo.query(`SELECT * FROM (
            SELECT room_id FROM ex__rooms WHERE room_type = 1
            UNION
            SELECT member_room_id AS room_id FROM ex__room_members
            LEFT JOIN ex__rooms ON room_id = member_room_id
            WHERE member_user_id = ? AND room_type != 1
            ) AS rooms GROUP BY room_id`, [user_id]);
        const rooms_id = [];
        for (const row of rows) {
            if (row['room_id']) {
                rooms_id.push(row['room_id']);
            }
        }
        return rooms_id;
    }

    async delete(room_id: string): Promise<boolean> {
        if (await this.roomRepo._delete(room_id)) {
            await getCustomService(RoomMemberService).delete({member_room_id: room_id});
            await getCustomService(RoomMessageService).delete({message_room_id: room_id});
            await getCustomService(RoomFileService).delete({file_room_id: room_id});
            return true;
        }
        return false;
    }
}
