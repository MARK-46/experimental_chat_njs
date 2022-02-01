import {Middleware, ExpressMiddlewareInterface} from 'routing-controllers';
import {NextFunction, Response} from 'express';
import {IRequest} from "../bin/common/interfaces/request.interface";
import {StatusCodesEnum} from "../bin/common/enum/status-codes.enum";
import {L} from "../bin/utils";
import {getCustomService} from "../bin/utils/service-register.utility";
import {TokenService} from "../services/token.service";
import {UserService} from "../services/user.service";
import {socketServer} from "../index";
import {SocketClient, SocketClientHandler} from "../socket/socket-client.handler";
import {responseError} from "../bin/utils/response.utility";

@Middleware({type: 'before'})
export class AuthMiddleware implements ExpressMiddlewareInterface {
    public async use(req: IRequest, res: Response, next?: NextFunction): Promise<any> {
        const token = req.header('ex-authorization') || null;
        const socket_id = req.header('ex-id') || null;

        if (!token) {
            return responseError(res, null, {}, L('UNAUTHENTICATED', req.language_code, 1001), StatusCodesEnum.UNAUTHENTICATED);
        }

        if (!socket_id) {
            return responseError(res, null, {}, L('UNAUTHENTICATED', req.language_code, 1002), StatusCodesEnum.UNAUTHENTICATED);
        }

        const tokenService = getCustomService(TokenService);
        const tokenData = await tokenService.getAccessToken(token);

        if (!tokenData) {
            return responseError(res, null, {}, L('UNAUTHENTICATED', req.language_code, 1003), StatusCodesEnum.UNAUTHENTICATED);
        }

        const userService = getCustomService(UserService);
        const userData = await userService.findByID(tokenData.user_id);

        if (!userData) {
            return responseError(res, null, {}, L('UNAUTHENTICATED', req.language_code, 1004), StatusCodesEnum.UNAUTHENTICATED);
        }

        if (!socketServer.clients().has(userData.user_id)) {
            return responseError(res, null, {}, L('UNAUTHENTICATED', req.language_code, 1005), StatusCodesEnum.UNAUTHENTICATED);
        }

        const client = socketServer.clients().get<SocketClientHandler>(userData.user_id);
        if (!client.sockets.has(socket_id)) {
            return responseError(res, null, {}, L('UNAUTHENTICATED', req.language_code, 1006), StatusCodesEnum.UNAUTHENTICATED);
        }

        const clientSocket = client.sockets.get<SocketClient>(socket_id);

        if (clientSocket.token?.token != token) {
            return responseError(res, null, {}, L('UNAUTHENTICATED', req.language_code, 1007), StatusCodesEnum.UNAUTHENTICATED);
        }

        delete userData['user_password'];

        req.credentials = clientSocket.credentials;
        req.socketClient = clientSocket;
        req.socketClientHandler = client;

        req.headers['ex-user-id'] = userData.user_id;
        req.headers['ex-username'] = userData.user_username;

        return next();
    }
}
