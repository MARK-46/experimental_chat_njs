import {Body, Delete, Get, JsonController, Param, Post, Put, QueryParam, Req, Res, UseBefore} from "routing-controllers";
import {Response} from "express";
import {AuthMiddleware} from "../../middlewares/auth.middleware";
import {In} from "typeorm";
import {IRequest} from "../../bin/common/interfaces/request.interface";
import {RoomMemberRequestModel, RoomRequestModel} from "../../models/requests/room/room-request.model";
import {RoomService} from "../../services/room/room.service";
import {getCustomService} from "../../bin/utils/service-register.utility";
import {StatusCodesEnum} from "../../bin/common/enum/status-codes.enum";
import {L, ValidatorUtility} from "../../bin/utils";
import {RoomMemberService} from "../../services/room/room-member.service";
import {RoomTypesEnum} from "../../bin/common/enum/room-types.enum";
import {UserRolesEnum} from "../../bin/common/enum/user-roles.enum";
import {SocketSignalActions} from "../../socket/socket-signal.actions";
import {AccessService} from "../../services/access.service";
import {IResponse} from "../../bin/common/interfaces/respons.interface";
import {response, responseError, responseValidationError} from "../../bin/utils/response.utility";

@UseBefore(AuthMiddleware)
@JsonController('/api/v1/room')
export class RoomController {
    @Get('/list')
    async list(@Req() req: IRequest, @Res() res: Response,
               @QueryParam('take') take: number,
               @QueryParam('skip') skip: number,
               @QueryParam('types') types: string | string[],
               @QueryParam('expand_last_message') expandLastMessage: string,
               @QueryParam('expand_last_message_files') expandLastMessageFiles: string,
               @QueryParam('expand_last_message_reply') expandLastMessageReply: string,
               @QueryParam('expand_last_message_reply_files') expandLastMessageReplyFiles: string): Promise<Response<IResponse>> {
        const typeList: string[] = types ? typeof types == 'string' ? types.split(',') : types : undefined;

        const validatorResult = await ValidatorUtility.check({
            types: typeList
        }, {
            "types": "required|is_array",
            "types.*": `string|in:${Object.keys(RoomTypesEnum).join(',')}`,
        });

        if (validatorResult) {
            return responseValidationError(res, req, validatorResult);
        }

        const typeListOfNumber = typeList.map(name => RoomTypesEnum[name]);

        const roomService = getCustomService(RoomService);
        const availableRooms = await roomService.availableRoomIdList(req.credentials.user_id);

        const rooms = await roomService.allRooms({
            take, skip,
            where: {
                room_type: In(typeListOfNumber),
                room_id: In(availableRooms)
            }
        }, expandLastMessage == 'true',expandLastMessageFiles == 'true',
            expandLastMessageReply == 'true', expandLastMessageReplyFiles == 'true', req.credentials.user_id);

        return response(res, false, rooms, {}, null, StatusCodesEnum.SUCCESS);
    }

    @Post('/create')
    async create(@Req() req: IRequest, @Res() res: Response, @Body() data: RoomRequestModel): Promise<Response<IResponse>> {
        if (!(await getCustomService(AccessService).canCreateRoom(req.credentials.user_id))) {
            return responseError(res, null, {}, L('FORBIDDEN', req.language_code), StatusCodesEnum.FORBIDDEN);
        }

        const validatorResult = await ValidatorUtility.check(data, {
            "room_id": "regex:^[A-Za-z0-9_-]{3,15}$|unique:chat,ex__rooms,room_id",
            "room_type": `required|in:${Object.values(RoomTypesEnum).join(',')}`,
            "room_name": `requiredIf:room_type,${RoomTypesEnum.GROUP},${RoomTypesEnum.PRIVATE_GROUP}|maxLength:64`,
            "room_image": `requiredIf:room_type,${RoomTypesEnum.GROUP},${RoomTypesEnum.PRIVATE_GROUP}|is_object|file_mimetype:image/gif,image/png,image/jpg,image/jpeg`,
        });

        if (validatorResult) {
            return responseValidationError(res, req, validatorResult);
        }

        const roomService = getCustomService(RoomService);

        const newRoom = await roomService.create({
            room_id: data.room_id,
            room_type: data.room_type,
            room_name: data.room_name,
            room_image: data.room_image ? data.room_image?.public_path : undefined
        }, req.credentials.user_id);

        if (newRoom) {
            const roomMemberService = getCustomService(RoomMemberService);

            // add creator
            await roomMemberService.create(newRoom.room_id, req.credentials.user_id, UserRolesEnum.ADMIN);

            SocketSignalActions.sendCreatedRoom(newRoom.room_id);

            return response(res, false, newRoom, {}, null, StatusCodesEnum.SUCCESS);
        }

        return responseError(res, null, {}, L('BAD_REQUEST', req.language_code), StatusCodesEnum.BAD_REQUEST);
    }

    @Put('/:room_id/update')
    async update(@Req() req: IRequest, @Res() res: Response, @Param('room_id') roomId: string, @Body() data: RoomRequestModel): Promise<Response<IResponse>> {
        if (!(await getCustomService(AccessService).canEditRoom(req.credentials.user_id, roomId))) {
            return responseError(res, null, {}, L('FORBIDDEN', req.language_code), StatusCodesEnum.FORBIDDEN);
        }

        const validatorResult = await ValidatorUtility.check(data, {
            "room_type": `required|in:${Object.values(RoomTypesEnum).join(',')}`,
            "room_name": `requiredIf:room_type,${RoomTypesEnum.GROUP},${RoomTypesEnum.PRIVATE_GROUP}|maxLength:64`,
            "room_image": `requiredIf:room_type,${RoomTypesEnum.GROUP},${RoomTypesEnum.PRIVATE_GROUP}|is_object|file_mimetype:image/gif,image/png,image/jpg,image/jpeg`,
        });

        if (validatorResult) {
            return responseValidationError(res, req, validatorResult);
        }

        const roomService = getCustomService(RoomService);

        const room = await roomService.update(roomId, {
            room_type: data.room_type,
            room_name: data.room_name,
            room_image: data.room_image ? data.room_image?.public_path : undefined
        }, req.credentials.user_id);

        if (room) {
            const roomMemberService = getCustomService(RoomMemberService);

            // add editor if not exists
            if (!(await roomMemberService.exists(roomId, req.credentials.user_id))) {
                await roomMemberService.create(roomId, req.credentials.user_id, UserRolesEnum.ADMIN);
            }

            SocketSignalActions.sendCreatedRoom(roomId);

            return response(res, false, room, {}, null, StatusCodesEnum.SUCCESS);
        }

        return responseError(res, null, {}, L('BAD_REQUEST', req.language_code), StatusCodesEnum.BAD_REQUEST);
    }

    @Post('/:room_id/add-member')
    async addMember(@Req() req: IRequest, @Res() res: Response, @Param('room_id') roomId: string, @Body() data: RoomMemberRequestModel): Promise<Response<IResponse>> {
        if (!(await getCustomService(AccessService).canEditRoom(req.credentials.user_id, roomId))) {
            return responseError(res, null, {}, L('FORBIDDEN', req.language_code), StatusCodesEnum.FORBIDDEN);
        }

        const validatorResult = await ValidatorUtility.check(data, {
            "members.*.id": "required|uuid",
            "members.*.role": `required|in:${Object.values(UserRolesEnum).join(',')}`,
        });

        if (validatorResult) {
            return responseValidationError(res, req, validatorResult);
        }

        const roomMemberService = getCustomService(RoomMemberService);

        await roomMemberService.delete({member_room_id: roomId});
        await roomMemberService.create(roomId, req.credentials.user_id, UserRolesEnum.ADMIN);

        for (const member of data.members) {
            if (req.credentials.user_id == member.id) continue;
            await roomMemberService.create(roomId, member.id, member.role);
        }

        const members_id = data.members.map(member => member.id);
        SocketSignalActions.sendCreatedRoom(roomId, members_id);

        return response(res, false, null, {}, L('SUCCESSFULLY', req.language_code), StatusCodesEnum.CREATED);
    }

    @Get('/:room_id/join')
    async join(@Req() req: IRequest, @Res() res: Response, @Param('room_id') roomId: string): Promise<Response<IResponse>> {
        if (!(await getCustomService(AccessService).canJoinRoom(req.credentials.user_id, roomId))) {
            return responseError(res, null, {}, L('FORBIDDEN', req.language_code), StatusCodesEnum.FORBIDDEN);
        }

        const roomService = getCustomService(RoomService);
        if (!(await roomService.exists(roomId))) {
            return responseError(res, null, {}, L('NOT_FOUND', req.language_code, roomId), StatusCodesEnum.NOT_FOUND);
        }

        if (!req.socketClientHandler.rooms.includes(roomId)) {
            for (const _room_id of req.socketClientHandler.rooms) {
                req.socketClientHandler.leave(_room_id, req.socketClient);
            }
            req.socketClientHandler.join(roomId, req.socketClient);
        }

        const room = await roomService.findOne(roomId, false, true, false, req.credentials.user_id);

        SocketSignalActions.sendCreatedRoom(roomId);

        return response(res, false, room, {}, null, StatusCodesEnum.SUCCESS);
    }

    @Get('/:room_id/leave')
    async leave(@Req() req: IRequest, @Res() res: Response, @Param('room_id') roomId: string): Promise<Response<IResponse>> {
        if (!(await getCustomService(AccessService).canJoinRoom(req.credentials.user_id, roomId))) {
            return responseError(res, null, {}, L('FORBIDDEN', req.language_code), StatusCodesEnum.FORBIDDEN);
        }

        const roomService = getCustomService(RoomService);
        if (!(await roomService.exists(roomId))) {
            return responseError(res, null, {}, L('NOT_FOUND', req.language_code, roomId), StatusCodesEnum.NOT_FOUND);
        }

        req.socketClientHandler.leave(roomId, req.socketClient);

        SocketSignalActions.sendCreatedRoom(roomId);

        return response(res, false, null, {}, L('SUCCESSFULLY', req.language_code), StatusCodesEnum.CREATED);
    }

    @Get('/:room_id/subscribe')
    async subscribe(@Req() req: IRequest, @Res() res: Response, @Param('room_id') roomId: string): Promise<Response<IResponse>> {
        if (!(await getCustomService(AccessService).canSubscribeRoom(req.credentials.user_id, roomId))) {
            return responseError(res, null, {}, L('FORBIDDEN', req.language_code), StatusCodesEnum.FORBIDDEN);
        }

        const roomService = getCustomService(RoomService);
        const roomMemberService = getCustomService(RoomMemberService);
        if (!(await roomService.exists(roomId))) {
            return responseError(res, null, {}, L('NOT_FOUND', req.language_code, roomId), StatusCodesEnum.NOT_FOUND);
        }

        const room = await roomService.findOne(roomId, false, true, false, req.credentials.user_id);

        if (room.room_type == RoomTypesEnum.PRIVATE || room.room_type == RoomTypesEnum.PRIVATE_GROUP) {
            return responseError(res, null, {}, L('FORBIDDEN', req.language_code), StatusCodesEnum.FORBIDDEN);
        }

        if (await roomMemberService.exists(roomId, req.credentials.user_id)) {
            return responseError(res, null, {}, L('ALREADY_SUBSCRIBED', req.language_code), StatusCodesEnum.BAD_REQUEST);
        }

        await roomMemberService.create(roomId, req.credentials.user_id, UserRolesEnum.GUEST);

        return response(res, false, null, {}, L('SUBSCRIBED', req.language_code), StatusCodesEnum.SUCCESS);
    }

    @Get('/:room_id/unsubscribe')
    async unsubscribe(@Req() req: IRequest, @Res() res: Response, @Param('room_id') roomId: string): Promise<Response<IResponse>> {
        if (!(await getCustomService(AccessService).canSubscribeRoom(req.credentials.user_id, roomId))) {
            return responseError(res, null, {}, L('FORBIDDEN', req.language_code), StatusCodesEnum.FORBIDDEN);
        }

        const roomService = getCustomService(RoomService);
        const roomMemberService = getCustomService(RoomMemberService);
        if (!(await roomService.exists(roomId))) {
            return responseError(res, null, {}, L('NOT_FOUND', req.language_code, roomId), StatusCodesEnum.NOT_FOUND);
        }

        const room = await roomService.findOne(roomId, false, true, false, req.credentials.user_id);

        if (room.room_type == RoomTypesEnum.PRIVATE || room.room_type == RoomTypesEnum.PRIVATE_GROUP) {
            return responseError(res, null, {}, L('FORBIDDEN', req.language_code), StatusCodesEnum.FORBIDDEN);
        }

        if (!(await roomMemberService.exists(roomId, req.credentials.user_id))) {
            return responseError(res, null, {}, L('NOT_SUBSCRIBED', req.language_code), StatusCodesEnum.BAD_REQUEST);
        }

        await roomMemberService.delete({member_room_id: roomId, member_user_id: req.credentials.user_id});

        return response(res, false, null, {}, L('UNSUBSCRIBED', req.language_code), StatusCodesEnum.SUCCESS);
    }

    @Delete('/:room_id')
    async delete(@Req() req: IRequest, @Res() res: Response, @Param('room_id') roomId: string): Promise<Response<IResponse>> {
        if (!(await getCustomService(AccessService).canDeleteRoom(req.credentials.user_id, roomId))) {
            return responseError(res, null, {}, L('FORBIDDEN', req.language_code), StatusCodesEnum.FORBIDDEN);
        }

        const roomService = getCustomService(RoomService);

        if (!(await roomService.exists(roomId))) {
            return responseError(res, null, {}, L('NOT_FOUND', req.language_code, roomId), StatusCodesEnum.NOT_FOUND);
        }

        if (await roomService.delete(roomId)) {
            SocketSignalActions.sendDeletedRoom(roomId);
            return response(res, false, null, {}, L('SUCCESSFULLY', req.language_code), StatusCodesEnum.CREATED);
        }
        return responseError(res, null, {}, L('UNEXPECTED_ERROR', req.language_code), StatusCodesEnum.BAD_REQUEST);
    }
}
