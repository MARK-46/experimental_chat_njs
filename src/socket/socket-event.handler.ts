import {SocketClient, SocketClientHandler} from "./socket-client.handler";
import {SocketServer} from "../bin/servers/socket.server";
import {UserDataModel} from "../models/responses/user-data.model";
import {SocketEventsEnum} from "../bin/common/enum/socket-events.enum";
import { LanguageCodeMiddleware } from "../middlewares/language-code.middleware";
import { L } from "../bin/utils";
import { getCustomService } from "../bin/utils/service-register.utility";
import { UserService } from "../services/user.service";
import { TokenService } from "../services/token.service";

export class SocketEventHandler {
    private _socketServer: SocketServer;

    constructor(socketServer: SocketServer) {
        this._socketServer = socketServer;

        this.middleware();
        this.defaultEvents();
    }

    private middleware(): void {
        this._socketServer.server.use(async (client: SocketClient, next: (err?: Error) => void) => {
            const token = client.handshake.query['ex-authorization'] as string;
            const language_code = LanguageCodeMiddleware.getCode(client.handshake.query['ex-language'] as string);
            
            if (!token) {
                return client.kick(L('UNAUTHENTICATED', language_code, 2001));
            }
            
            const userService = getCustomService(UserService);
            const tokenService = getCustomService(TokenService);
            const tokenData = await tokenService.getAccessToken(token);
            
            if (!tokenData) {
                return client.kick(L('UNAUTHENTICATED', language_code, 2002));
            }
            
            const userData = await userService.findByID(tokenData.user_id);
            if (!userData) {
                return client.kick(L('UNAUTHENTICATED', language_code, 2003));
            }
            
            client.token = tokenData;
            client.credentials = new UserDataModel(
                userData.user_id,
                userData.user_role,
                userData.user_name,
                userData.user_email,
                userData.user_status,
                userData.user_username,
                userData.user_image,
                userData.user_created_at,
                userData.user_updated_at
            );
            client.handler = this.addClient(client.credentials.user_id, client);
            client.handler.credentials = client.credentials;

            if (await client.handler.onConnecting(client)) {
                return next(null);
            }

            return client.kick('disconnected by server');
        });
    }

    private defaultEvents(): void {
        this._socketServer.server.on(SocketEventsEnum.CONNECTION, (client: SocketClient) => {
            client.on(SocketEventsEnum.DISCONNECT, () => {
                client.handler.onDisconnected(client);
                client.handler.sockets.delete(client.id);
                if (client.handler.sockets.size == 0) {
                    this._socketServer.clients().delete(client.credentials.user_id);
                }
            });

            client.handler.onConnected(client);
        });
    }

    private addClient(uid: string, client: SocketClient): SocketClientHandler {
        if (!this._socketServer.clients().has(uid)) {
            this._socketServer.clients().set(uid, new SocketClientHandler());
        }

        const handler = this._socketServer.clients().get<SocketClientHandler>(uid);
        handler.sockets.set(client.id, client);

        return handler;
    }
}
