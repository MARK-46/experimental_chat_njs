/*
    BY MARK-46
 */
import "reflect-metadata"

import { env } from "./bin/utils";

import { setCustomService } from "./bin/utils/service-register.utility";
import { HttpServer } from "./bin/servers/http.server";
import { ExpressServer } from "./bin/servers/express.server";
import { SocketServer } from "./bin/servers/socket.server";
import { DatabaseClient } from "./bin/clients/database.client";
import { TokenService } from "./services/token.service";
import { UserService } from "./services/user.service";
import { RoomService } from "./services/room/room.service";
import { RoomFileService } from "./services/room/room-file.service";
import { RoomMessageService } from "./services/room/room-message.service";
import { RoomMemberService } from "./services/room/room-member.service";
import { GatewayController } from "./controllers/gateway.controller";
import { AuthController } from "./controllers/auth.controller";
import { RoomMessageController } from "./controllers/room/room-message.controller";
import { RoomController } from "./controllers/room/room.controller";
import { UserController } from "./controllers/user.controller";
import { ErrorHandlerMiddleware } from "./middlewares/error-handler.middleware";
import { FinalMiddleware } from "./middlewares/final.middleware";
import { CorsMiddleware } from "./middlewares/cors.middleware";
import { AccessService } from "./services/access.service";
import { LanguageCodeMiddleware } from "./middlewares/language-code.middleware";
import { RoomRecipientService } from "./services/room/room-recipient.service";

export const httpServer = new HttpServer();
export const expressServer = new ExpressServer();
export const socketServer = new SocketServer();

new DatabaseClient().connect(async (err, connections) => {
    if (err) {
        return console.error('DATABASE: CONNECTION ERROR -', err.message);
    }

    // load hooks
    require('./socket/hooks/chat-signaller.hook');
    // require('./socket/hooks/webrtc-signaller.hook');

    // load services
    await setCustomService(AccessService);
    await setCustomService(TokenService);
    await setCustomService(UserService);
    await setCustomService(RoomService);
    await setCustomService(RoomMemberService);
    await setCustomService(RoomMessageService);
    await setCustomService(RoomFileService);
    await setCustomService(RoomRecipientService);

    expressServer.create("", httpServer,
        [
            GatewayController, AuthController, UserController, RoomController, RoomMessageController
        ],
        [
            LanguageCodeMiddleware, CorsMiddleware, FinalMiddleware, ErrorHandlerMiddleware
        ]);

    httpServer.listen(env("SERVER_HOST"), env("SERVER_PORT"), expressServer.requestHandler, (server) => {
        socketServer.create(env("SERVER_SOCKET_PATH"), server);
        console.log('HTTP SERVER LISTEN ON %s;', env("SERVER_PORT"));
    });
});
