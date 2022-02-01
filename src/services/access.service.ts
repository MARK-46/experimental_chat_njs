import { getConnection } from "typeorm";
import { IService } from "../bin/common/interfaces/service.interface";

export class AccessService implements IService {
    async use(...args: any): Promise<void> { }

    async canJoinRoom(user_id: string, room_id: string): Promise<Boolean> {
        return this.canQuery(`SELECT * FROM ex__rooms 
        LEFT JOIN ex__room_members ON member_room_id = room_id 
        LEFT JOIN ex__users ON user_id = member_user_id 
        WHERE room_id = ? AND (member_user_id = ? OR room_type = 1 OR user_role IN (1,2,3))`, room_id, user_id);
    }

    async canSubscribeRoom(user_id: string, room_id: string): Promise<Boolean> {
        return this.canQuery(`SELECT member_user_id FROM ex__rooms 
		LEFT JOIN ex__room_members ON member_room_id = room_id 
		LEFT JOIN ex__users ON user_id = member_user_id 
		WHERE room_id = ? AND room_type = 2 AND member_user_id = ?`, room_id, user_id);
    }

    async canCreateRoom(user_id: string): Promise<Boolean> {
        return true;
    }

    async canEditRoom(user_id: string, room_id: string): Promise<Boolean> {
        return this.canQuery(`SELECT * FROM ex__rooms 
        LEFT JOIN ex__room_members ON member_room_id = room_id 
        LEFT JOIN ex__users ON user_id = member_user_id 
        WHERE room_id = ? AND member_user_id = ? AND (member_role IN (1,2,3) OR user_role IN (1,2,3))`, room_id, user_id);
    }

    async canDeleteRoom(user_id: string, room_id: string): Promise<Boolean> {
        return this.canQuery(`SELECT * FROM ex__rooms 
        LEFT JOIN ex__room_members ON member_room_id = room_id 
        LEFT JOIN ex__users ON user_id = member_user_id 
        WHERE room_id = ? AND member_user_id = ? AND (member_role IN (1,2,3) OR user_role IN (1,2,3))`, room_id, user_id);
    }

    async canCreateRoomMessage(user_id: string, room_id: string): Promise<Boolean> {
        return this.canQuery(`SELECT * FROM ex__rooms 
        LEFT JOIN ex__room_members ON member_room_id = room_id 
        LEFT JOIN ex__users ON user_id = member_user_id 
        WHERE room_id = ? AND (member_user_id = ? OR room_type = 1 OR user_role IN (1,2,3))`, room_id, user_id);
    }

    async canEditRoomMessage(user_id: string, room_id: string, message_id: string): Promise<Boolean> {
        return this.canQuery(`SELECT * FROM ex__rooms 
            LEFT JOIN ex__room_messages ON message_room_id = room_id 
            LEFT JOIN ex__room_members ON member_room_id = room_id 
            LEFT JOIN ex__users ON user_id = member_user_id 
            WHERE room_id = ? AND message_id = ? AND (
            (member_user_id = ? AND member_role IN (1,2,3)) OR message_user_id = ? OR user_role IN (1,2,3)
        )`, room_id, message_id, user_id, user_id);
    }

    async canDeleteRoomMessage(user_id: string, room_id: string, message_id: string): Promise<Boolean> {
        return this.canQuery(`SELECT * FROM ex__rooms 
            LEFT JOIN ex__room_messages ON message_room_id = room_id 
            LEFT JOIN ex__room_members ON member_room_id = room_id 
            LEFT JOIN ex__users ON user_id = member_user_id 
            WHERE room_id = ? AND message_id = ? AND (
            (member_user_id = ? AND member_role IN (1,2,3)) OR message_user_id = ? OR user_role IN (1,2,3)
        )`, room_id, message_id, user_id, user_id);
    }

    private async canQuery(sql: string, ...args: any): Promise<boolean> {
        return (await getConnection('chat').query(`SELECT EXISTS(${sql}) AS can;`, [...args]))[0]['can'] == 1;
    }
}
