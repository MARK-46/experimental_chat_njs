import { RoomMemberService } from "../services/room/room-member.service";
import { RoomService } from "../services/room/room.service";
import { RoomMessageService } from "../services/room/room-message.service";
import { socketServer } from "../index";
import { getCustomService } from "../bin/utils/service-register.utility";
import { SocketSignalCodesEnum } from "../bin/common/enum/socket-signal-codes.enum";
import { RoomTypesEnum } from "../bin/common/enum/room-types.enum";
import { UserDataModel } from "../models/responses/user-data.model";
import { RoomRecipientService } from "../services/room/room-recipient.service";

export class SocketSignalActions {
    static sendCreatedRoom(room_id: string, members_id: string[] = []): void {
        new Promise(async (done) => {
            const roomService = getCustomService(RoomService);
            const roomMemberService = getCustomService(RoomMemberService);
            const roomRecipientService = getCustomService(RoomRecipientService);

            const room = await roomService.findOne(room_id, true, false);
            if (room) {
                if (members_id.length == 0) {
                    const members = await roomMemberService.members(room_id);
                    members_id.push(...members.map(member => member.member_user_id));
                }

                for (const member_id of members_id) {
                    room.room_nrm_count = await roomRecipientService.getRNMCount(member_id, room.room_id);
                    socketServer.sendSignal([member_id], SocketSignalCodesEnum.SIGNAL_CREATED_ROOM, room);
                }

                if (room.room_type == RoomTypesEnum.GROUP) {
                    socketServer.sendSignalBroadcast(members_id, SocketSignalCodesEnum.SIGNAL_CREATED_ROOM, room);
                }
            }

            done(null);
        }).then(() => { });
    }

    static sendCreatedRoomMessage(message_id: string, members_id: string[] = [], withRoom: boolean = true): void {
        new Promise(async (done) => {
            const roomService = getCustomService(RoomService);
            const roomMessageService = getCustomService(RoomMessageService);
            const roomMemberService = getCustomService(RoomMemberService);

            const message = await roomMessageService.findOne(message_id, true, true, true, true);
            if (message) {
                const room = await roomService.findOne(message.message_room_id, true, false);
                if (room) {
                    if (members_id.length == 0) {
                        const members = await roomMemberService.members(message.message_room_id);
                        members_id.push(...members.map(member => member.member_user_id));
                    }
                    if (withRoom) {
                        socketServer.sendSignal(members_id, SocketSignalCodesEnum.SIGNAL_CREATED_ROOM, room);
                    }
                    socketServer.sendSignal(members_id, SocketSignalCodesEnum.SIGNAL_CREATED_ROOM_MESSAGE, message);
                    if (room.room_type == RoomTypesEnum.GROUP) {
                        if (withRoom) {
                            socketServer.sendSignalBroadcast(members_id, SocketSignalCodesEnum.SIGNAL_CREATED_ROOM, room);
                        }
                        socketServer.sendSignalBroadcast(members_id, SocketSignalCodesEnum.SIGNAL_CREATED_ROOM_MESSAGE, message);
                    }
                }
            }
            done(null);
        }).then(() => { });
    }

    static sendDeletedRoom(room_id: string, members_id: string[] = []): void {
        new Promise(async (done) => {
            const roomService = getCustomService(RoomService);
            const roomMemberService = getCustomService(RoomMemberService);

            const room = await roomService.findOne(room_id, false, false, true);
            if (room) {
                if (members_id.length == 0) {
                    const members = await roomMemberService.members(room_id);
                    members_id.push(...members.map(member => member.member_user_id));
                }
                const data = {
                    room_id
                };
                socketServer.sendSignal(members_id, SocketSignalCodesEnum.SIGNAL_DELETED_ROOM, data);
                if (room.room_type == RoomTypesEnum.GROUP) {
                    socketServer.sendSignalBroadcast(members_id, SocketSignalCodesEnum.SIGNAL_DELETED_ROOM, data);
                }
            }

            done(null);
        }).then(() => { });
    }

    static sendDeletedRoomMessage(room_id: string, message_id: string, members_id: string[] = []): void {
        new Promise(async (done) => {
            const roomService = getCustomService(RoomService);
            const roomMemberService = getCustomService(RoomMemberService);
            const room = await roomService.findOne(room_id, true, false);
            if (room) {
                if (members_id.length == 0) {
                    const members = await roomMemberService.members(room_id);
                    members_id.push(...members.map(member => member.member_user_id));
                }
                const data = {
                    message_id: message_id,
                    message_room_id: room_id,
                };
                socketServer.sendSignal(members_id, SocketSignalCodesEnum.SIGNAL_CREATED_ROOM, room);
                socketServer.sendSignal(members_id, SocketSignalCodesEnum.SIGNAL_DELETED_ROOM_MESSAGE, data);
                if (room.room_type == RoomTypesEnum.GROUP) {
                    socketServer.sendSignalBroadcast(members_id, SocketSignalCodesEnum.SIGNAL_CREATED_ROOM, room);
                    socketServer.sendSignalBroadcast(members_id, SocketSignalCodesEnum.SIGNAL_DELETED_ROOM_MESSAGE, data);
                }
            }

            done(null);
        }).then(() => { });
    }

    static sendTypingStatus(room_id: string, typing: boolean, user: UserDataModel, members_id: string[] = []): void {
        new Promise(async (done) => {
            const roomService = getCustomService(RoomService);
            const roomMemberService = getCustomService(RoomMemberService);

            const room = await roomService.findOne(room_id, true, false);
            if (room) {
                if (members_id.length == 0) {
                    const members = await roomMemberService.members(room_id);
                    members_id.push(...members.map(member => member.member_user_id));
                }
                const data = {
                    typing_status: typing,
                    typing_user: user
                }
                socketServer.sendSignal(members_id.filter(id => id != user.user_id), SocketSignalCodesEnum.CLIENT_SIGNAL_TYPING_MESSAGE, data);
                if (room.room_type == RoomTypesEnum.GROUP) {
                    members_id.push(user.user_id);
                    socketServer.sendSignalBroadcast(members_id, SocketSignalCodesEnum.CLIENT_SIGNAL_TYPING_MESSAGE, data);
                }
            }
            done(null);
        }).then(() => { });
    }
}
