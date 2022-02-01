import {Body, Delete, Get, JsonController, Param, Post, Put, QueryParam, Req, Res, UseBefore} from "routing-controllers";
import {Response} from "express";
import {AuthMiddleware} from "../../middlewares/auth.middleware";
import {IRequest} from "../../bin/common/interfaces/request.interface";
import {getCustomService} from "../../bin/utils/service-register.utility";
import {StatusCodesEnum} from "../../bin/common/enum/status-codes.enum";
import {L, ValidatorUtility} from "../../bin/utils";
import {RoomService} from "../../services/room/room.service";
import {RoomMessageService} from "../../services/room/room-message.service";
import {RoomMessageRequestModel} from "../../models/requests/room/room-request.model";
import {RoomMessageTypesEnum} from "../../bin/common/enum/room-message-types.enum";
import {RoomFileService} from "../../services/room/room-file.service";
import {SocketSignalActions} from "../../socket/socket-signal.actions";
import {AccessService} from "../../services/access.service";
import {response, responseError, responseValidationError} from "../../bin/utils/response.utility";
import {IResponse} from "../../bin/common/interfaces/respons.interface";

@UseBefore(AuthMiddleware)
@JsonController('/api/v1/room/:room_id/message')
export class RoomMessageController {
    @Get('/list')
    async list(@Req() req: IRequest, @Res() res: Response,
               @Param('room_id') roomId: string,
               @QueryParam('take') take: number,
               @QueryParam('skip') skip: number,
               @QueryParam('expand_files') expandFiles: string,
               @QueryParam('expand_reply') expandReply: string,
               @QueryParam('expand_reply_files') expandReplyFiles: string,
               @QueryParam('expand_recipients') expandRecipients: string): Promise<Response<IResponse>> {
        if (!(await getCustomService(AccessService).canJoinRoom(req.credentials.user_id, roomId))) {
            return responseError(res, null, {}, L('FORBIDDEN', req.language_code), StatusCodesEnum.FORBIDDEN);
        }

        const roomService = getCustomService(RoomService);
        const roomMessagesService = getCustomService(RoomMessageService);
        if (!(await roomService.exists(roomId))) {
            return responseError(res, null, {}, L('NOT_FOUND', req.language_code, roomId), StatusCodesEnum.NOT_FOUND);
        }

        const messages = await roomMessagesService.allMessages({
                take, skip,
                where: {message_room_id: roomId}
            }, expandFiles == 'true',
            expandReply == 'true',
            expandReplyFiles == 'true',
            expandRecipients == 'true');

        return response(res, false, messages, {}, null, StatusCodesEnum.SUCCESS);
    }

    @Post('/create')
    async create(@Req() req: IRequest, @Res() res: Response, @Param('room_id') roomId: string,
                 @Body() data: RoomMessageRequestModel): Promise<Response<IResponse>> {
        if (!(await getCustomService(AccessService).canCreateRoomMessage(req.credentials.user_id, roomId))) {
            return responseError(res, null, {}, L('FORBIDDEN', req.language_code), StatusCodesEnum.FORBIDDEN);
        }

        if (!req.socketClientHandler.rooms.includes(roomId)) {
            return responseError(res, null, {}, L('NOT_IN_ROOM', req.language_code), StatusCodesEnum.BAD_REQUEST);
        }

        const validatorResult = await ValidatorUtility.check(data, {
            "message_reply_id": 'uuid',
            "message_type": `required|in:${Object.values(RoomMessageTypesEnum).join(',')}`,
            "message_files": `requiredIf:message_type,${RoomMessageTypesEnum.AUDIO},${RoomMessageTypesEnum.VIDEO}|is_array`,
            "message_files.*": 'is_object',
        });

        if (validatorResult) {
            return responseValidationError(res, req, validatorResult);
        }

        const roomMessageService = getCustomService(RoomMessageService);
        const roomFileService = getCustomService(RoomFileService);
        
        let newMessage = await roomMessageService.create({
            message_room_id: roomId,
            message_reply_id: data.message_reply_id,
            message_user_id: req.credentials.user_id,
            message_content: data.message_content,
            message_type: data.message_type
        });

        if (newMessage) {
            for (const file of data.message_files || []) {
                await roomFileService.create(roomId, newMessage.message_id, file.filename, file.public_path, file.mimetype);
            }

            newMessage = await roomMessageService.findOne(newMessage.message_id);

            SocketSignalActions.sendCreatedRoomMessage(newMessage.message_id);

            return response(res, false, newMessage, {}, null, StatusCodesEnum.SUCCESS);
        }

        return responseError(res, null, {}, L('BAD_REQUEST', req.language_code), StatusCodesEnum.BAD_REQUEST);
    }

    @Put('/:message_id/update')
    async update(@Req() req: IRequest, @Res() res: Response, @Param('room_id') roomId: string,
            @Param('message_id') messageId: string, @Body() data: RoomMessageRequestModel): Promise<Response<IResponse>> {
        if (!(await getCustomService(AccessService).canEditRoomMessage(req.credentials.user_id, roomId, messageId))) {
            return responseError(res, null, {}, L('FORBIDDEN', req.language_code), StatusCodesEnum.FORBIDDEN);
        }

        if (!req.socketClientHandler.rooms.includes(roomId)) {
            return responseError(res, null, {}, L('NOT_IN_ROOM', req.language_code), StatusCodesEnum.BAD_REQUEST);
        }

        const validatorResult = await ValidatorUtility.check(data, {
            "message_reply_id": 'uuid',
            "message_type": `required|in:${Object.values(RoomMessageTypesEnum).join(',')}`,
            "message_files": `requiredIf:message_type,${RoomMessageTypesEnum.AUDIO},${RoomMessageTypesEnum.VIDEO}|is_array`,
            "message_files.*": 'is_object',
            "message_deleted_files": 'is_array',
            "message_deleted_files.*": 'number'
        });

        if (validatorResult) {
            return responseValidationError(res, req, validatorResult);
        }

        const roomMessageService = getCustomService(RoomMessageService);
        const roomFileService = getCustomService(RoomFileService);
        
        await roomMessageService.update(roomId, messageId, {
            message_reply_id: data.message_reply_id,
            message_content: data.message_content,
            message_type: data.message_type
        });
    
        for (const file_id of data.message_deleted_files || []) {
            await roomFileService.delete({file_id});
        }

        for (const file of data.message_files || []) {
            await roomFileService.create(roomId, messageId, file.filename, file.public_path, file.mimetype);
        }

        const message = await roomMessageService.findOne(messageId);

        SocketSignalActions.sendCreatedRoomMessage(messageId);

        return response(res, false, message, {}, null, StatusCodesEnum.SUCCESS);
    }

    @Delete('/:message_id')
    async delete(@Req() req: IRequest, @Res() res: Response,
                 @Param('room_id') roomId: string, @Param('message_id') messageId: string): Promise<Response<IResponse>> {
        if (!(await getCustomService(AccessService).canDeleteRoomMessage(req.credentials.user_id, roomId, messageId))) {
            return responseError(res, null, {}, L('FORBIDDEN', req.language_code), StatusCodesEnum.FORBIDDEN);
        }

        const roomMessageService = getCustomService(RoomMessageService);

        if (await roomMessageService.delete({message_id: messageId})) {
            SocketSignalActions.sendDeletedRoomMessage(roomId, messageId);
            return response(res, false, null, {}, L('SUCCESSFULLY', req.language_code), StatusCodesEnum.CREATED);
        }
        return responseError(res, null, {}, L('UNEXPECTED_ERROR', req.language_code), StatusCodesEnum.BAD_REQUEST);
    }
}
